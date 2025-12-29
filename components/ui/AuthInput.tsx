import { FontAwesome5 } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../themed-text';

interface Props extends TextInputProps {
  label: string;
  iconName: string;
  isPassword?: boolean;
  error?: string;
  labelColor?: string;
}

export default function AuthInput({ label, iconName, isPassword, error, labelColor, ...props }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.label, labelColor && { color: labelColor }]}>{label}</ThemedText>
      
      <View style={[
        styles.inputContainer, 
        isFocused && styles.focused,
        error ? styles.errorBorder : null
      ]}>
        <FontAwesome5 
          name={iconName} 
          size={18} 
          color={error ? "#ff4444" : (isFocused ? "#0a7ea4" : "#999")} 
          style={styles.icon} 
        />
        
        <TextInput
          style={styles.input}
          placeholderTextColor="#ccc"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome5 name={showPassword ? "eye-slash" : "eye"} size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { marginBottom: 8, color: '#333', fontWeight: '500', fontSize: 14 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 15, height: 56,
    borderWidth: 1, borderColor: 'transparent'
  },
  focused: { borderColor: '#0a7ea4', backgroundColor: '#fff' },
  errorBorder: { borderColor: '#ff4444', backgroundColor: '#fff0f0' },
  icon: { marginRight: 10, width: 24, textAlign: 'center' },
  input: { flex: 1, height: '100%', color: '#333', fontSize: 16 },
  errorText: { color: '#ff4444', fontSize: 12, marginTop: 4, marginLeft: 4 }
});