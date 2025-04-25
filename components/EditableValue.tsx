import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';

interface Props {
  label: string;
  value: string | number;
  onSubmit: (newValue: number) => void;
}

export default function EditableValue({ label, value, onSubmit }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));

  const openModal = () => {
    setInputValue(String(value));
    setModalVisible(true);
  };

  const handleSubmit = () => {
    const num = Number(inputValue);
    if (!isNaN(num)) {
      onSubmit(num);
    }
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPress={openModal}>
        <Text style={styles.valueText}>{value}</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.label}>Edit {label}</Text>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              style={styles.input}
              autoFocus
            />
            <View style={styles.buttons}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={styles.submit}>
                <Text style={styles.submitText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34788c',
    textDecorationLine: 'underline',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
  },
  buttons: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancel: {
    marginRight: 20,
    color: '#666',
    fontWeight: '600',
  },
  submit: {
    backgroundColor: '#34788c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
});
