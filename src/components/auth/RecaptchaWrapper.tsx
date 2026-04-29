import { useEffect, useState } from 'react'

interface RecaptchaWrapperProps {
  onToken: (token: string) => void
}

declare global {
  interface Window {
    grecaptcha: any
  }
}

export default function RecaptchaWrapper({ onToken }: RecaptchaWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const siteKey = import.meta.env.PUBLIC_RECAPTCHA_SITEKEY

  useEffect(() => {
    if (!siteKey) {
      console.warn('reCAPTCHA site key not configured')
      return
    }

    // Load reCAPTCHA script
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.onload = () => {
      setIsLoaded(true)
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [siteKey])

  useEffect(() => {
    if (!isLoaded || !window.grecaptcha || !siteKey) return

    // Execute reCAPTCHA v3
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(siteKey, { action: 'submit' })
        .then((token: string) => {
          onToken(token)
        })
    })
  }, [isLoaded, onToken, siteKey])

  return <div className="text-xs text-slate-500">This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy">Privacy Policy</a> and <a href="https://policies.google.com/terms">Terms of Service</a> apply.</div>
}
