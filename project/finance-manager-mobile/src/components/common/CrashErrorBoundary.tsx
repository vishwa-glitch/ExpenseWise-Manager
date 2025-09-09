import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { debugLogger } from '../../utils/debugLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class CrashErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    debugLogger.error('CrashErrorBoundary', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: errorInfo.errorBoundary,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>App Crashed</Text>
          <Text style={styles.subtitle}>Something went wrong</Text>
          
          <ScrollView style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error Details:</Text>
            <Text style={styles.errorText}>
              {this.state.error?.message || 'Unknown error'}
            </Text>
            
            {this.state.error?.stack && (
              <>
                <Text style={styles.errorTitle}>Stack Trace:</Text>
                <Text style={styles.stackTrace}>
                  {this.state.error.stack}
                </Text>
              </>
            )}
            
            {this.state.errorInfo?.componentStack && (
              <>
                <Text style={styles.errorTitle}>Component Stack:</Text>
                <Text style={styles.stackTrace}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </>
            )}
          </ScrollView>
          
          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  errorContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    fontFamily: 'monospace',
  },
  stackTrace: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CrashErrorBoundary;
