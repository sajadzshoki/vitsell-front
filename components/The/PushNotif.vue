<script setup lang="ts">
import {PushNotifications} from "@capacitor/push-notifications";
import type {PushSubscriptionType, User} from "~/types/models";


const userId = useCookie('userId')
const pushNotificationsToken = useLocalStorage('push-token', '')
const user = useLocalStorage<User>('user', {})
const registerPushNotifications = async () => {
  if (!userId.value) return
  // Request permission to use push notifications
  let status = await PushNotifications.requestPermissions();

  if (status.receive === 'granted') {
    // Register with Firebase Cloud Messaging
    await PushNotifications.register();
  }

  // Listen for registration (to get the FCM token)
  PushNotifications.addListener('registration', async (token) => {
    const currentSub = user.value.firebaseTokens?.find(e => isEqual(e, token.value))
    if (currentSub) return
    const sub = [...(user.value.firebaseTokens || []), token.value] as string[]
    const {result} = await usePut<User>(`/user/${userId.value}`, {
      firebaseTokens: sub
    })
    result && (user.value.firebaseTokens = result.firebaseTokens)
    pushNotificationsToken.value = token.value
    console.log('FCM Token:', token.value); // Log the FCM token
    // You can send this token to your backend for future use
  });

  // Listen for when a push notification is received
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received:', notification);
    // alert(`Push Notification: ${notification.body}`);
  });

  // Listen for when a push notification is tapped/opened
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push action performed:', notification);
    // alert(`Push Notification Tapped: ${notification.notification.body}`);
  });
}
onMounted( () => {
 registerPushNotifications()
})

watch(() => userId.value, registerPushNotifications)
</script>

