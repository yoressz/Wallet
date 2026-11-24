import React, { useEffect } from 'react';
import { StyleSheet, Text, Animated, View, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface ToastState {
  visible: boolean;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
}

interface ToastProps {
  toast: ToastState;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const translateY = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (toast.visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();

      const timer = setTimeout(() => {
        dismiss();
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-100);
    }
  }, [toast.visible]);

  function dismiss() {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  }

  if (!toast.visible) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';

  const iconName = isError
    ? 'alert-circle'
    : isSuccess
    ? 'check-circle'
    : isWarning
    ? 'alert-triangle'
    : 'info';

  const iconColor = isError
    ? '#EF4444'
    : isSuccess
    ? '#10B981'
    : isWarning
    ? '#F59E0B'
    : '#FAFAFA';

  return (
    <Animated.View style={[styles.toastContainer, { transform: [{ translateY }] }]}>
      <View style={styles.toastBox}>
        <Feather name={iconName} size={18} color={iconColor} style={{ marginRight: 10 }} />
        <Text style={styles.toastText} numberOfLines={2}>
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#27272A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: '100%',
  },
  toastText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#FAFAFA',
    fontSize: 13,
  },
});
