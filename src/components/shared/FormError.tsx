interface FormErrorProps {
  message?: string
}

/** Standard error message shown below a form input */
export default function FormError({ message }: FormErrorProps) {
  if (!message) return null
  return <p className="text-xs text-red-500 mt-1">{message}</p>
}
