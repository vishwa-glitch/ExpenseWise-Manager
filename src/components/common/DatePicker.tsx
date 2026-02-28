import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface DatePickerProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  title: string;
  initialDate?: Date;
  minDate?: Date;
  maxDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  visible,
  onClose,
  onDateSelect,
  title,
  initialDate = new Date(),
  minDate,
  maxDate,
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  useEffect(() => {
    if (visible) {
      setSelectedDate(initialDate);
      setCurrentMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    }
  }, [visible, initialDate]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDatePress = (date: Date) => {
    if (!isDateDisabled(date)) {
      setSelectedDate(date);
    }
  };

  const handleConfirm = () => {
    onDateSelect(selectedDate);
    onClose();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const disabled = isDateDisabled(date);
      const selected = isDateSelected(date);
      const today = isToday(date);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            selected && styles.selectedDay,
            today && !selected && styles.today,
            disabled && styles.disabledDay,
          ]}
          onPress={() => handleDatePress(date)}
          disabled={disabled}
        >
          <Text
            style={[
              styles.dayText,
              selected && styles.selectedDayText,
              today && !selected && styles.todayText,
              disabled && styles.disabledDayText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedDateLabel}>Selected Date:</Text>
            <Text style={styles.selectedDateText}>{formatSelectedDate(selectedDate)}</Text>
          </View>

          <View style={styles.quickDateButtons}>
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => setSelectedDate(new Date())}
            >
              <Text style={styles.quickDateButtonText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedDate(tomorrow);
              }}
            >
              <Text style={styles.quickDateButtonText}>Tomorrow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                setSelectedDate(nextWeek);
              }}
            >
              <Text style={styles.quickDateButtonText}>Next Week</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() => navigateMonth('prev')}
                style={styles.navigationButton}
              >
                <Text style={styles.navigationButtonText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthYearText}>{formatMonthYear(currentMonth)}</Text>
              <TouchableOpacity
                onPress={() => navigateMonth('next')}
                style={styles.navigationButton}
              >
                <Text style={styles.navigationButtonText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysContainer}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.weekDayText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    margin: spacing.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  selectedDateContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  selectedDateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  selectedDateText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  quickDateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  quickDateButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  quickDateButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  calendarContainer: {
    marginBottom: spacing.lg,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navigationButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  navigationButtonText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  monthYearText: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '600',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 1,
  },
  dayText: {
    ...typography.body,
    color: colors.text,
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  selectedDayText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  today: {
    backgroundColor: colors.primary + '20',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  todayText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  disabledDay: {
    backgroundColor: colors.surface,
  },
  disabledDayText: {
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginLeft: spacing.sm,
    alignItems: 'center',
  },
  confirmButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
});

export default DatePicker;
