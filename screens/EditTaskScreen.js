// screens/EditTaskScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedButton from '../components/AnimatedButton';
import { db } from '../firebaseConfig';
import { ref, get, update } from 'firebase/database';
import { auth } from '../firebaseConfig'; // ✅ Needed to identify the user

export default function EditTaskScreen({ route, navigation }) {
  const { taskId } = route.params;
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('');

  useEffect(() => {
    loadTask();
  }, []);

  const loadTask = async () => {
    try {
      const userId = auth.currentUser.uid;
      const taskRef = ref(db, `tasks/${userId}/${taskId}`);
      const snapshot = await get(taskRef);

      if (snapshot.exists()) {
        const task = snapshot.val();
        setTaskTitle(task.title || '');
        setTaskCategory(task.category || '');
      } else {
        Alert.alert('Error', 'Task not found.');
      }
    } catch (error) {
      console.error('Error loading task:', error);
      Alert.alert('Error', 'Could not load task data.');
    }
  };

  const saveEditedTask = async () => {
    try {
      const userId = auth.currentUser.uid;
      const taskRef = ref(db, `tasks/${userId}/${taskId}`);
      await update(taskRef, {
        title: taskTitle,
        category: taskCategory,
      });

      Alert.alert('Success', 'Task updated!');
      navigation.navigate('TaskList');
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Could not update task.');
    }
  };

  return (
    <LinearGradient colors={['#0b0c10', '#1f2833']} style={styles.container}>
      <Text style={styles.title}>Edit Your Task</Text>

      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={taskTitle}
        onChangeText={setTaskTitle}
        placeholderTextColor="#c5c6c7"
      />

      <TextInput
        style={styles.input}
        placeholder="Category (e.g., Work, Personal)"
        value={taskCategory}
        onChangeText={setTaskCategory}
        placeholderTextColor="#c5c6c7"
      />

      <AnimatedButton title="Save Changes" onPress={saveEditedTask} />
      <AnimatedButton title="Cancel" onPress={() => navigation.goBack()} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  title: { fontSize: 28, color: '#66fcf1', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#45a29e',
    backgroundColor: '#1f2833',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    color: '#ffffff',
  },
});
