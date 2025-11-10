import { useForm as useReactHookForm, UseFormProps, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

/**
 * Custom hook that wraps react-hook-form with Zod validation
 *
 * @example
 * const form = useForm({
 *   schema: customerSchema,
 *   defaultValues: { name: '', phone: '' }
 * })
 */
export function useForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'> & {
    schema: TSchema
  }
): UseFormReturn<z.infer<TSchema>> {
  const { schema, ...formProps } = props

  return useReactHookForm<z.infer<TSchema>>({
    ...formProps,
    resolver: zodResolver(schema),
  })
}
