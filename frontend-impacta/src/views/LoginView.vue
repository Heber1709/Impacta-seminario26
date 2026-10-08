<template>
  <div class="login-page">
    <div class="login-card">

      <div class="logo-box">
        IMPACTA
      </div>

      <h1>IMPACTA</h1>
      <p class="subtitle">Gestión de donaciones</p>

      <div class="divider"></div>

      <h2>Bienvenido</h2>

      <p class="description">
        Inicia sesión para acceder a la plataforma.
      </p>

<GoogleLogin
  :callback="handleGoogleLogin"
  :client-id="googleClientId"
  class="google-button"
/>     

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GoogleLogin } from 'vue3-google-login'
import type { CallbackTypes } from 'vue3-google-login'

const googleClientId = '964007219567-hcchnfsnnh5mltrr8bget5vagcdes6lu.apps.googleusercontent.com'
console.log('GOOGLE CLIENT ID:', googleClientId)
const errorMessage = ref('')

const handleGoogleLogin: CallbackTypes.CredentialCallback = async (response) => {
  errorMessage.value = ''

  try {
    const res = await fetch('http://localhost:3000/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: response.credential
      })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'No fue posible iniciar sesión.')
    }

    localStorage.setItem('accessToken', data.accessToken)
   localStorage.setItem('usuario', JSON.stringify(data.usuario))

window.location.href = '/dashboard'

  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible iniciar sesión.'
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f4f8f6;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 48px 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
}

.logo-box {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #74c69d;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

h1 {
  margin: 0;
  color: #123f36;
  font-size: 28px;
}

.subtitle {
  margin-top: 6px;
  color: #7d918b;
}

.divider {
  width: 50px;
  height: 2px;
  margin: 28px auto;
  background: #74c69d;
}

h2 {
  margin-bottom: 8px;
  color: #234d45;
}

.description {
  color: #82928e;
  margin-bottom: 28px;
}

.google-button {
  width: 100%;
}

.error {
  margin-top: 18px;
  color: #c0392b;
  font-size: 14px;
}
</style>
