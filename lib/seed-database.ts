import {
  ParcelType,
  PaymentStatus,
  ServiceType,
  ShipmentStatus,
  ShipmentType,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function seedDatabase(): Promise<void> {
  const passwordHash = await bcrypt.hash("Test@1234", 12);
  const user = await prisma.user.upsert({
    where: { email: "test@swiftship.in" },
    create: {
      name: "Test User",
      email: "test@swiftship.in",
      phone: "9999999999",
      passwordHash,
      isVerified: true,
    },
    update: {
      passwordHash,
      isVerified: true,
    },
  });

  const shipments: Array<{
    awbNumber: string;
    status: ShipmentStatus;
    originPincode: string;
    originCity: string;
    originState: string;
    destPincode: string;
    destCity: string;
    destState: string;
    receiverName: string;
    events: Array<{
      status: ShipmentStatus;
      location: string;
      description: string;
      timestamp: Date;
    }>;
  }> = [
    {
      awbNumber: "SW2025011401",
      status: ShipmentStatus.DELIVERED,
      originPincode: "110001",
      originCity: "New Delhi",
      originState: "Delhi",
      destPincode: "400001",
      destCity: "Mumbai",
      destState: "Maharashtra",
      receiverName: "Receiver One",
      events: [
        {
          status: ShipmentStatus.BOOKED,
          location: "New Delhi",
          description: "Shipment booked and awaiting pickup",
          timestamp: new Date("2025-01-14T10:30:00"),
        },
        {
          status: ShipmentStatus.PICKED_UP,
          location: "New Delhi",
          description: "Package collected from sender",
          timestamp: new Date("2025-01-14T15:00:00"),
        },
        {
          status: ShipmentStatus.IN_TRANSIT,
          location: "Nagpur",
          description: "Package in transit",
          timestamp: new Date("2025-01-15T02:00:00"),
        },
        {
          status: ShipmentStatus.OUT_FOR_DELIVERY,
          location: "Mumbai",
          description: "Out for delivery",
          timestamp: new Date("2025-01-16T09:00:00"),
        },
        {
          status: ShipmentStatus.DELIVERED,
          location: "Mumbai",
          description: "Delivered to recipient",
          timestamp: new Date("2025-01-16T14:00:00"),
        },
      ],
    },
    {
      awbNumber: "SW2025011402",
      status: ShipmentStatus.IN_TRANSIT,
      originPincode: "560001",
      originCity: "Bengaluru",
      originState: "Karnataka",
      destPincode: "500001",
      destCity: "Hyderabad",
      destState: "Telangana",
      receiverName: "Receiver Two",
      events: [
        {
          status: ShipmentStatus.BOOKED,
          location: "Bengaluru",
          description: "Shipment booked and awaiting pickup",
          timestamp: new Date("2025-01-14T11:00:00"),
        },
        {
          status: ShipmentStatus.PICKED_UP,
          location: "Bengaluru",
          description: "Package collected from sender",
          timestamp: new Date("2025-01-14T16:00:00"),
        },
        {
          status: ShipmentStatus.IN_TRANSIT,
          location: "Hyderabad",
          description: "Package in transit",
          timestamp: new Date("2025-01-15T08:00:00"),
        },
      ],
    },
    {
      awbNumber: "SW2025011403",
      status: ShipmentStatus.OUT_FOR_DELIVERY,
      originPincode: "600001",
      originCity: "Chennai",
      originState: "Tamil Nadu",
      destPincode: "641001",
      destCity: "Coimbatore",
      destState: "Tamil Nadu",
      receiverName: "Receiver Three",
      events: [
        {
          status: ShipmentStatus.BOOKED,
          location: "Chennai",
          description: "Shipment booked and awaiting pickup",
          timestamp: new Date("2025-01-13T09:00:00"),
        },
        {
          status: ShipmentStatus.PICKUP_SCHEDULED,
          location: "Chennai",
          description: "Pickup scheduled",
          timestamp: new Date("2025-01-13T12:00:00"),
        },
        {
          status: ShipmentStatus.PICKED_UP,
          location: "Chennai",
          description: "Package collected from sender",
          timestamp: new Date("2025-01-13T17:00:00"),
        },
        {
          status: ShipmentStatus.OUT_FOR_DELIVERY,
          location: "Coimbatore",
          description: "Out for delivery",
          timestamp: new Date("2025-01-16T10:00:00"),
        },
      ],
    },
    {
      awbNumber: "SW2025011404",
      status: ShipmentStatus.BOOKED,
      originPincode: "700001",
      originCity: "Kolkata",
      originState: "West Bengal",
      destPincode: "711101",
      destCity: "Howrah",
      destState: "West Bengal",
      receiverName: "Receiver Four",
      events: [
        {
          status: ShipmentStatus.BOOKED,
          location: "Kolkata",
          description: "Shipment booked and awaiting pickup",
          timestamp: new Date("2025-01-16T08:00:00"),
        },
      ],
    },
    {
      awbNumber: "SW2025011405",
      status: ShipmentStatus.CANCELLED,
      originPincode: "411001",
      originCity: "Pune",
      originState: "Maharashtra",
      destPincode: "422001",
      destCity: "Nashik",
      destState: "Maharashtra",
      receiverName: "Receiver Five",
      events: [
        {
          status: ShipmentStatus.BOOKED,
          location: "Pune",
          description: "Shipment booked and awaiting pickup",
          timestamp: new Date("2025-01-12T10:00:00"),
        },
        {
          status: ShipmentStatus.CANCELLED,
          location: "Pune",
          description: "Shipment cancelled by sender",
          timestamp: new Date("2025-01-12T12:00:00"),
        },
      ],
    },
  ];

  for (const s of shipments) {
    await prisma.shipment.deleteMany({ where: { awbNumber: s.awbNumber } });
    const created = await prisma.shipment.create({
      data: {
        awbNumber: s.awbNumber,
        userId: user.id,
        shipmentType: ShipmentType.DOMESTIC,
        senderName: user.name,
        senderPhone: user.phone,
        senderEmail: user.email,
        originPincode: s.originPincode,
        originCity: s.originCity,
        originState: s.originState,
        senderAddress: `${s.originCity} hub`,
        receiverName: s.receiverName,
        receiverPhone: "9876543210",
        receiverEmail: "receiver@example.com",
        destPincode: s.destPincode,
        destCity: s.destCity,
        destState: s.destState,
        destCountry: "India",
        receiverAddress: `${s.destCity} delivery address`,
        parcelType: ParcelType.PARCEL,
        weight: 2.5,
        length: 30,
        breadth: 20,
        height: 15,
        declaredValue: 5000,
        serviceType: ServiceType.EXPRESS,
        baseCharge: 200,
        taxAmount: 45,
        totalAmount: 245,
        paymentStatus: PaymentStatus.PAID,
        status: s.status,
        bookedAt: s.events[0]?.timestamp ?? new Date(),
        estimatedDelivery: new Date("2025-01-20T00:00:00.000Z"),
      },
    });
    for (const e of s.events) {
      await prisma.trackingEvent.create({
        data: {
          shipmentId: created.id,
          status: e.status,
          location: e.location,
          description: e.description,
          timestamp: e.timestamp,
        },
      });
    }
  }

  console.log("Seed completed for", user.email);
}
