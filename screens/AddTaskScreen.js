import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Picker, Button, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AnimatedButton from '../components/AnimatedButton';
import { database, auth } from '../firebaseConfig';
import { ref, push, set } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

export default function AddTaskScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userId, setUserId] = useState(null);

  // Get current user ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });

    Notifications.requestPermissionsAsync();

    return unsubscribe;
  }, []);

  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Task title cannot be empty!');
      return;
    }

    if (!userId) {
      Alert.alert('Authentication Error', 'You must be signed in to add tasks.');
      return;
    }

    const newTask = {
      title,
      description,
      category,
      deadline: deadline.toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const userTasksRef = ref(database, `tasks/${userId}`);
      const newTaskRef = push(userTasksRef);
      await set(newTaskRef, newTask);

      await scheduleNotification();

      Alert.alert('Task Added!', `Task "${title}" scheduled successfully.`);
      navigation.navigate('TaskList');
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    }
  };

  const scheduleNotification = async () => {
    const triggerTime = new Date(deadline);
    triggerTime.setMinutes(triggerTime.getMinutes() - 30);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Task Reminder!',
        body: `Your task "${title}" is almost due!`,
      },
      trigger: { date: triggerTime },
    });
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || deadline;
    setShowDatePicker(false);
    setDeadline(currentDate);
  };

  return (
    <LinearGradient colors={['#d5f4ff', '#a6e4f9']} style={styles.container}>
      <Text style={styles.title}>Create New Task</Text>

      <TextInput
        style={styles.input}
        placeholder="Task Title"
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Task Description"
        placeholderTextColor="#666"
        value={description}
        onChangeText={setDescription}
      />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          style={{ color: '#000' }}
          onValueChange={itemValue => setCategory(itemValue)}
        >
          <Picker.Item label="Work" value="Work" />
          <Picker.Item label="Personal" value="Personal" />
          <Picker.Item label="Others" value="Others" />
        </Picker>
      </View>

      <Button title="Pick Deadline" color="#0077cc" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker value={deadline} mode="datetime" display="default" onChange={onChangeDate} />
      )}

      <AnimatedButton title="Save Task" onPress={handleAddTask} />
      <AnimatedButton title="Back to Tasks" onPress={() => navigation.navigate('TaskList')} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#000' },
  input: { height: 50, marginBottom: 15, borderRadius: 10, paddingHorizontal: 15, fontSize: 16, backgroundColor: '#fff', color: '#000' },
  pickerContainer: { marginBottom: 15, borderRadius: 10, backgroundColor: '#fff' },
});
