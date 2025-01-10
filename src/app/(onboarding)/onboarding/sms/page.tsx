'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CountryCodeSelect } from '@/components/common/CountryCodeSelector'

const businessFormSchema = z.object({
  legalEntityName: z.string().min(1, 'Legal entity name is required'),
  websiteUrl: z.string().url('Please enter a valid URL'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Please enter a valid email'),
  countryCode: z.string().min(1, 'Country code is required'),
  phoneNumber: z.string().min(5, 'Please enter a valid phone number'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms of service',
  }),
})

export default function TollFreeVerificationStepper() {
  const businessForm = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      country: 'US',
      countryCode: '+1',
      termsAccepted: false,
    },
  })

  const onSubmitBusinessForm = async (
    values: z.infer<typeof businessFormSchema>,
  ) => {
    console.log('Form Values:', values)
    try {
      // API call here
      console.log('Form submitted successfully')
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <div className="w-full min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-[1000px] mx-auto">
        <CardHeader className="space-y-4">
          <CardTitle className="text-2xl font-semibold text-center">
            Messaging toll-free verification
          </CardTitle>
          <CardDescription className="text-center text-sm">
            To use this phone number for SMS/MMS, a verification process is
            required. Messaging configuration will be disabled until you submit
            the number for verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Form {...businessForm}>
            <form
              onSubmit={businessForm.handleSubmit(onSubmitBusinessForm)}
              className="space-y-6"
            >
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">
                  Business and contact information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={businessForm.control}
                    name="legalEntityName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          Legal entity name
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="cursor-help">
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Enter your registered business name</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter legal entity name"
                            className="h-10 text-sm bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={businessForm.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Website URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://"
                            className="h-10 text-sm bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Business Address</h3>
                  <div className="space-y-4">
                    <FormField
                      control={businessForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Street address"
                              className="h-10 text-sm bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={businessForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="City"
                                className="h-10 text-sm bg-background"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={businessForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="State"
                                  className="h-10 text-sm bg-background"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={businessForm.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="ZIP code"
                                  className="h-10 text-sm bg-background"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Contact Information</h3>
                  <div className="space-y-4">
                    <FormField
                      control={businessForm.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Contact name"
                              className="h-10 text-sm bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={businessForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="Email"
                                className="h-10 text-sm bg-background"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Phone Number
                        </FormLabel>
                        <div className="flex space-x-2">
                          <FormField
                            control={businessForm.control}
                            name="countryCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <CountryCodeSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={businessForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Phone number"
                                    className="h-10 text-sm bg-background"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormItem>
                    </div>
                  </div>
                </div>

                <FormField
                  control={businessForm.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I agree to the Terms of Service. I certify that the
                          associated Business Profile is the originator of the
                          phone calls and certify that I will participate in
                          traceback efforts, including those initiated by the
                          Secure Telephone Identity Policy Administrator
                          (STI-PA) and the US Telecom Traceback Group.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-10">
                  Send information for verification
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
