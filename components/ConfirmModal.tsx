import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface ConfirmModalState {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm?: () => void;
}

interface ConfirmModalProps {
  modal: ConfirmModalState;
  onClose: () => void;
}

export function ConfirmModal({ modal, onClose }: ConfirmModalProps) {
  if (!modal.visible) return null;

  const isDestructive = modal.isDestructive !== false;

  return (
    <Modal visible={modal.visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View style={styles.iconHeaderRow}>
                <View style={[styles.iconCircle, isDestructive ? styles.destructiveIconCircle : styles.infoIconCircle]}>
                  <Feather
                    name={isDestructive ? 'trash-2' : 'help-circle'}
                    size={22}
                    color={isDestructive ? '#EF4444' : '#FAFAFA'}
                  />
                </View>
              </View>

              <Text style={styles.title}>{modal.title}</Text>
              <Text style={styles.message}>{modal.message}</Text>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>{modal.cancelText || 'Cancel'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmBtn, isDestructive ? styles.destructiveBtn : styles.primaryBtn]}
                  onPress={() => {
                    if (modal.onConfirm) modal.onConfirm();
                    onClose();
                  }}
                >
                  <Text style={[styles.confirmBtnText, isDestructive ? styles.destructiveBtnText : styles.primaryBtnText]}>
                    {modal.confirmText || (isDestructive ? 'Delete' : 'Confirm')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  iconHeaderRow: {
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destructiveIconCircle: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  infoIconCircle: {
    backgroundColor: 'rgba(250, 250, 250, 0.12)',
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: '#FAFAFA',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#27272A',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  cancelBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#E4E4E7',
    fontSize: 14,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  destructiveBtn: {
    backgroundColor: '#EF4444',
  },
  primaryBtn: {
    backgroundColor: '#FAFAFA',
  },
  confirmBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
  },
  destructiveBtnText: {
    color: '#FFFFFF',
  },
  primaryBtnText: {
    color: '#09090B',
  },
});
