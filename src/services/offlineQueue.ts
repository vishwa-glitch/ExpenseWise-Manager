import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkUtils } from '../utils/networkUtils';

export interface OfflineOperation {
  id: string;
  type: 'CREATE_TRANSACTION' | 'UPDATE_TRANSACTION' | 'DELETE_TRANSACTION' | 'CREATE_BUDGET' | 'UPDATE_BUDGET' | 'DELETE_BUDGET' | 'CREATE_GOAL' | 'UPDATE_GOAL' | 'DELETE_GOAL';
  data: any;
  timestamp: number;
  retryCount: number;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
}

class OfflineQueueService {
  private static instance: OfflineQueueService;
  private readonly QUEUE_KEY = 'offline_operations_queue';
  private readonly MAX_RETRY_COUNT = 3;
  private isProcessing = false;

  private constructor() {
    this.initializeNetworkListener();
  }

  public static getInstance(): OfflineQueueService {
    if (!OfflineQueueService.instance) {
      OfflineQueueService.instance = new OfflineQueueService();
    }
    return OfflineQueueService.instance;
  }

  private initializeNetworkListener() {
    const networkUtils = NetworkUtils.getInstance();
    networkUtils.addListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        this.processQueue();
      }
    });
  }

  /**
   * Add an operation to the offline queue
   */
  public async addToQueue(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    const queueOperation: OfflineOperation = {
      ...operation,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    try {
      const queue = await this.getQueue();
      queue.push(queueOperation);
      await this.saveQueue(queue);
      
      console.log(`📝 Added operation to offline queue: ${operation.type}`, queueOperation.id);
      return queueOperation.id;
    } catch (error) {
      console.error('❌ Failed to add operation to offline queue:', error);
      throw error;
    }
  }

  /**
   * Process all pending operations in the queue
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('⏳ Queue processing already in progress');
      return;
    }

    const networkUtils = NetworkUtils.getInstance();
    if (!networkUtils.isOnline()) {
      console.log('📡 No internet connection, skipping queue processing');
      return;
    }

    this.isProcessing = true;
    console.log('🔄 Starting offline queue processing...');

    try {
      const queue = await this.getQueue();
      if (queue.length === 0) {
        console.log('✅ No pending operations in queue');
        return;
      }

      console.log(`📋 Processing ${queue.length} pending operations`);

      for (const operation of queue) {
        try {
          await this.processOperation(operation);
          await this.removeFromQueue(operation.id);
          console.log(`✅ Successfully processed operation: ${operation.type}`, operation.id);
        } catch (error) {
          console.error(`❌ Failed to process operation: ${operation.type}`, operation.id, error);
          
          // Increment retry count
          operation.retryCount++;
          
          if (operation.retryCount >= this.MAX_RETRY_COUNT) {
            console.log(`🗑️ Removing operation after max retries: ${operation.type}`, operation.id);
            await this.removeFromQueue(operation.id);
          } else {
            // Update the operation with new retry count
            await this.updateOperationInQueue(operation);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error processing offline queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single operation
   */
  private async processOperation(operation: OfflineOperation): Promise<void> {
    const { apiService } = await import('./api');
    
    switch (operation.method) {
      case 'POST':
        await apiService.request({
          url: operation.endpoint,
          method: 'POST',
          data: operation.data,
        });
        break;
      case 'PUT':
        await apiService.request({
          url: operation.endpoint,
          method: 'PUT',
          data: operation.data,
        });
        break;
      case 'DELETE':
        await apiService.request({
          url: operation.endpoint,
          method: 'DELETE',
        });
        break;
      default:
        throw new Error(`Unsupported method: ${operation.method}`);
    }
  }

  /**
   * Get the current queue from storage
   */
  private async getQueue(): Promise<OfflineOperation[]> {
    try {
      const queueData = await AsyncStorage.getItem(this.QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('❌ Failed to get offline queue:', error);
      return [];
    }
  }

  /**
   * Save the queue to storage
   */
  private async saveQueue(queue: OfflineOperation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('❌ Failed to save offline queue:', error);
      throw error;
    }
  }

  /**
   * Remove an operation from the queue
   */
  private async removeFromQueue(operationId: string): Promise<void> {
    const queue = await this.getQueue();
    const filteredQueue = queue.filter(op => op.id !== operationId);
    await this.saveQueue(filteredQueue);
  }

  /**
   * Update an operation in the queue
   */
  private async updateOperationInQueue(updatedOperation: OfflineOperation): Promise<void> {
    const queue = await this.getQueue();
    const updatedQueue = queue.map(op => 
      op.id === updatedOperation.id ? updatedOperation : op
    );
    await this.saveQueue(updatedQueue);
  }

  /**
   * Get queue status
   */
  public async getQueueStatus(): Promise<{ pending: number; failed: number }> {
    const queue = await this.getQueue();
    const failed = queue.filter(op => op.retryCount >= this.MAX_RETRY_COUNT).length;
    return {
      pending: queue.length - failed,
      failed,
    };
  }

  /**
   * Clear the entire queue (useful for testing or user logout)
   */
  public async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.QUEUE_KEY);
      console.log('🧹 Offline queue cleared');
    } catch (error) {
      console.error('❌ Failed to clear offline queue:', error);
    }
  }

  /**
   * Generate a unique ID for operations
   */
  private generateId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default OfflineQueueService;
