import React, { memo } from 'react';
import { TransactionItem } from '../common/TransactionItem';

interface MemoizedTransactionItemProps {
  transaction: any;
  onPress: () => void;
  onLongPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showAccount?: boolean;
  runningBalance?: number;
}

/**
 * Memoized transaction item component for better performance
 */
const MemoizedTransactionItem: React.FC<MemoizedTransactionItemProps> = memo(({
  transaction,
  onPress,
  onLongPress,
  onEdit,
  onDelete,
  showAccount,
  runningBalance,
}) => {
  return (
    <TransactionItem
      transaction={transaction}
      onPress={onPress}
      onLongPress={onLongPress}
      onEdit={onEdit}
      onDelete={onDelete}
      showAccount={showAccount}
      runningBalance={runningBalance}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  return (
    prevProps.transaction.id === nextProps.transaction.id &&
    prevProps.transaction.amount === nextProps.transaction.amount &&
    prevProps.transaction.description === nextProps.transaction.description &&
    prevProps.transaction.transaction_date === nextProps.transaction.transaction_date &&
    prevProps.transaction.type === nextProps.transaction.type &&
    prevProps.runningBalance === nextProps.runningBalance &&
    prevProps.showAccount === nextProps.showAccount
  );
});

MemoizedTransactionItem.displayName = 'MemoizedTransactionItem';

export default MemoizedTransactionItem;