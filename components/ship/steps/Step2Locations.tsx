"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRY_NAMES } from "@/lib/countries";
import { useBookingStore } from "@/store/useBookingStore";

const schema = z.object({
  senderName: z.string().min(1),
  senderPhone: z.string().regex(/^[6-9]\d{9}$/),
  senderEmail: z.string().email(),
  originPincode: z.string().regex(/^\d{6}$/),
  originCity: z.string(),
  originState: z.string(),
  senderAddress: z.string().min(1),
  receiverName: z.string().min(1),
  receiverPhone: z.string().regex(/^[6-9]\d{9}$/),
  receiverEmail: z.string().email(),
  destPincode: z.string().min(1),
  destCity: z.string(),
  destState: z.string(),
  destCountry: z.string().min(1),
  receiverAddress: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

type UserLite = { name?: string | null; phone?: string | null; email?: string | null };

export function Step2Locations({ user }: { user: UserLite }) {
  const { shipmentType, patch, setStep } = useBookingStore();
  const [originErr, setOriginErr] = React.useState<string | null>(null);
  const [destErr, setDestErr] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      senderName: user.name ?? "",
      senderPhone: user.phone ?? "",
      senderEmail: user.email ?? "",
      originPincode: "",
      originCity: "",
      originState: "",
      senderAddress: "",
      receiverName: "",
      receiverPhone: "",
      receiverEmail: "",
      destPincode: "",
      destCity: "",
      destState: "",
      destCountry: "India",
      receiverAddress: "",
    },
  });

  const originPin = form.watch("originPincode");
  const destPin = form.watch("destPincode");

  React.useEffect(() => {
    if (!/^\d{6}$/.test(originPin)) return;
    let cancelled = false;
    (async () => {
      const r = await fetch(`/api/pincode/${originPin}`);
      const j = await r.json().catch(() => ({}));
      if (cancelled) return;
      if (!r.ok) {
        setOriginErr(j.error ?? "Pincode not found");
        form.setValue("originCity", "Unknown");
        form.setValue("originState", "Unknown");
        return;
      }
      setOriginErr(null);
      form.setValue("originCity", j.city);
      form.setValue("originState", j.state);
    })();
    return () => {
      cancelled = true;
    };
  }, [originPin, form]);

  React.useEffect(() => {
    if (shipmentType !== "DOMESTIC") return;
    if (!/^\d{6}$/.test(destPin)) return;
    let cancelled = false;
    (async () => {
      const r = await fetch(`/api/pincode/${destPin}`);
      const j = await r.json().catch(() => ({}));
      if (cancelled) return;
      if (!r.ok) {
        setDestErr(j.error ?? "Pincode not found");
        form.setValue("destCity", "Unknown");
        form.setValue("destState", "Unknown");
        return;
      }
      setDestErr(null);
      form.setValue("destCity", j.city);
      form.setValue("destState", j.state);
    })();
    return () => {
      cancelled = true;
    };
  }, [destPin, shipmentType, form]);

  function onSubmit(v: FormValues) {
    if (shipmentType === "DOMESTIC" && !/^\d{6}$/.test(v.destPincode)) {
      form.setError("destPincode", { message: "Enter a valid 6-digit pincode" });
      return;
    }
    patch({
      senderName: v.senderName,
      senderPhone: v.senderPhone,
      senderEmail: v.senderEmail,
      originPincode: v.originPincode,
      originCity: v.originCity.trim() || "Unknown",
      originState: v.originState.trim() || "Unknown",
      senderAddress: v.senderAddress,
      receiverName: v.receiverName,
      receiverPhone: v.receiverPhone,
      receiverEmail: v.receiverEmail,
      destPincode: v.destPincode,
      destCity: v.destCity.trim() || "Unknown",
      destState: v.destState.trim() || "Unknown",
      destCountry: v.destCountry,
      receiverAddress: v.receiverAddress,
    });
    setStep(3);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold">Sender</h3>
            <FormField
              control={form.control}
              name="senderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <span className="flex h-10 items-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm">
                +91
              </span>
              <FormField
                control={form.control}
                name="senderPhone"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="senderEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="originPincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin pincode</FormLabel>
                  <FormControl>
                    <Input maxLength={6} {...field} />
                  </FormControl>
                  {originErr && (
                    <p className="text-sm text-red-600">{originErr}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="originCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="originState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senderAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full address</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold">Receiver</h3>
            <FormField
              control={form.control}
              name="receiverName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <span className="flex h-10 items-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm">
                +91
              </span>
              <FormField
                control={form.control}
                name="receiverPhone"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="receiverEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {shipmentType === "DOMESTIC" ? (
              <>
                <FormField
                  control={form.control}
                  name="destPincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination pincode</FormLabel>
                      <FormControl>
                        <Input maxLength={6} {...field} />
                      </FormControl>
                      {destErr && (
                        <p className="text-sm text-red-600">{destErr}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="destCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-72">
                          {COUNTRY_NAMES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destPincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal / ZIP code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State / Region</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="receiverAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full address</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
}
