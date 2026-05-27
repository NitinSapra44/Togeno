"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import api from "@/services/api";
import { createAddress, updateAddress, setDefaultShipping } from "@/services/address.service";
import { updateBrandDetails } from "@/services/brand.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Shield,
  Camera,
  Mail,
  Building,
  Save,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function BrandProfilePage() {
  const { user, profile, brandDetails, fetchCurrentUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [warehouse, setWarehouse] = useState<any>(null);

  const [gstForm, setGstForm] = useState({
    gstNumber: "",
    businessName: "",
    registeredAddress: "",
    billingState: "",
    billingPincode: "",
    billingEmail: "",
    contactNumber: "",
    panNumber: "",
  });
  const [isSavingGst, setIsSavingGst] = useState(false);

  const [warehouseForm, setWarehouseForm] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [isDefaultPickup, setIsDefaultPickup] = useState(true);
  const [isSavingWarehouse, setIsSavingWarehouse] = useState(false);

  useEffect(() => {
    async function fetchWarehouse() {
      try {
        const response = await api.get('/brands/me/pickup-settings');
        const addr = response.data.data.pickupAddress;
        setWarehouse(addr);
        if (addr) {
           setWarehouseForm({
             fullName: addr.full_name || "",
             phoneNumber: addr.phone || addr.phone_number || "",
             addressLine1: addr.address_line1 || "",
             addressLine2: addr.address_line2 || "",
             landmark: "", 
             city: addr.city || "",
             state: addr.state || "",
             postalCode: addr.postal_code || "",
             country: addr.country || "India",
           });
           setIsDefaultPickup(addr.is_default_shipping ?? true);
        }
      } catch (err) {
        console.error("Failed to load warehouse address", err);
      }
    }
    fetchWarehouse();

    // Pre-fill GST form from brandDetails
    if (brandDetails) {
      setGstForm({
        gstNumber: brandDetails.gstNumber ?? "",
        businessName: brandDetails.businessName ?? "",
        registeredAddress: brandDetails.registeredAddress ?? "",
        billingState: brandDetails.billingState ?? "",
        billingPincode: brandDetails.billingPincode ?? "",
        billingEmail: brandDetails.billingEmail ?? "",
        contactNumber: brandDetails.contactNumber ?? "",
        panNumber: brandDetails.panNumber ?? "",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Profile updated successfully");
    }, 1000);
  };

  const handleWarehouseSave = async () => {
    if (!warehouseForm.fullName || !warehouseForm.phoneNumber || !warehouseForm.addressLine1 || !warehouseForm.city || !warehouseForm.state || !warehouseForm.postalCode) {
      toast.error("Please fill all required fields");
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(warehouseForm.phoneNumber)) {
      toast.error("Phone Number must be exactly 10 digits");
      return;
    }
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(warehouseForm.postalCode)) {
      toast.error("PIN Code must be exactly 6 digits");
      return;
    }

    setIsSavingWarehouse(true);
    try {
      const combinedAddressLine2 = warehouseForm.landmark 
        ? `${warehouseForm.addressLine2} (Landmark: ${warehouseForm.landmark})`.trim() 
        : warehouseForm.addressLine2;

      const payload = {
        fullName: warehouseForm.fullName,
        phoneNumber: warehouseForm.phoneNumber,
        addressLine1: warehouseForm.addressLine1,
        addressLine2: combinedAddressLine2,
        city: warehouseForm.city,
        state: warehouseForm.state,
        postalCode: warehouseForm.postalCode,
        country: warehouseForm.country,
      };

      let newAddr;
      if (warehouse && warehouse.id) {
         newAddr = await updateAddress(warehouse.id, payload);
      } else {
         newAddr = await createAddress(payload);
      }
      
      if (isDefaultPickup) {
         await setDefaultShipping(newAddr.id);
      }

      setWarehouse({
        ...warehouse,
        id: newAddr.id,
        full_name: newAddr.fullName,
        phone: newAddr.phoneNumber,
        phone_number: newAddr.phoneNumber,
        address_line1: newAddr.addressLine1,
        address_line2: newAddr.addressLine2,
        city: newAddr.city,
        state: newAddr.state,
        postal_code: newAddr.postalCode,
        country: newAddr.country,
        is_default_shipping: isDefaultPickup,
      });

      toast.success("Warehouse Address saved successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save warehouse address");
    } finally {
      setIsSavingWarehouse(false);
    }
  };

  const handleGstSave = async () => {
    try {
      setIsSavingGst(true);
      await updateBrandDetails({
        gstNumber: gstForm.gstNumber || null,
        businessName: gstForm.businessName || null,
        registeredAddress: gstForm.registeredAddress || null,
        billingState: gstForm.billingState || null,
        billingPincode: gstForm.billingPincode || null,
        billingEmail: gstForm.billingEmail || null,
        contactNumber: gstForm.contactNumber || null,
        panNumber: gstForm.panNumber || null,
      });
      await fetchCurrentUser();
      toast.success("Billing details saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save billing details");
    } finally {
      setIsSavingGst(false);
    }
  };

  const tabTriggerClass =
    "data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 gap-2 px-4 py-2 rounded-md transition-all duration-200 hover:text-zinc-200 hover:bg-white/5";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-zinc-400">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="general" onValueChange={setActiveTab}>
        <div className="bg-zinc-900/50 border border-white/5 p-1 rounded-xl mb-8 w-fit">
          <TabsList className="bg-transparent h-auto p-0 gap-1">
            <TabsTrigger value="general" className={tabTriggerClass}>
              <User className="h-4 w-4" /> General
            </TabsTrigger>
            <TabsTrigger value="security" className={tabTriggerClass}>
              <Shield className="h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="billing" className={tabTriggerClass}>
              <Receipt className="h-4 w-4" /> Billing / GST
            </TabsTrigger>
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* ================= GENERAL TAB ================= */}
            <TabsContent value="general" className="space-y-6">
              <Card className="bg-[#0b0b0b] border-[#1f1f1f]">
                <CardHeader className="border-b border-white/5">
                  <CardTitle className="text-white">
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your profile details.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8 pt-8">
                  {/* Avatar */}
                  <div className="flex items-center gap-6 group">
                    <div className="relative">
                     <Avatar className="h-24 w-24 border-2 border-[#1f1f1f] shadow-xl">
  <AvatarImage
    src={
      profile?.avatarUrl
        ? profile.avatarUrl
        : undefined
    }
    alt="Profile"
  />
  <AvatarFallback className="bg-zinc-900 text-zinc-400 text-2xl font-medium">
    {profile?.fullName?.[0]?.toUpperCase() ||
      user?.email?.[0]?.toUpperCase() ||
      "U"}
  </AvatarFallback>
</Avatar>


                      <button className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 rounded-full text-white shadow-lg border-2 border-[#0b0b0b] hover:bg-emerald-500">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-white font-medium text-lg">
                        Profile Picture
                      </h3>
                      <p className="text-sm text-zinc-500">
                        Google photo appears automatically if logged in via Google.
                      </p>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        defaultValue={profile?.fullName || ""}
                        className="bg-[#111111] border-[#1f1f1f] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        disabled
                        defaultValue={user?.email || ""}
                        className="bg-[#0e0e0e] border-[#1f1f1f] text-zinc-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        defaultValue="Acme Inc."
                        className="bg-[#111111] border-[#1f1f1f] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input
                        disabled
                        defaultValue="Brand Administrator"
                        className="bg-[#0e0e0e] border-[#1f1f1f] text-zinc-500"
                      />
                    </div>

                    </div>
                </CardContent>

                <CardFooter className="flex justify-end border-t border-white/5">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="h-9 text-sm bg-white text-black hover:bg-zinc-200 font-medium"
                  >
                    {isLoading ? "Saving..." : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Add new Card for Warehouse Address */}
              <Card className="bg-[#0b0b0b] border-[#1f1f1f]">
                <CardHeader className="border-b border-white/5">
                  <CardTitle className="text-white">
                    Warehouse Address (Shiprocket Pickup Location)
                  </CardTitle>
                  <CardDescription>
                    Manage your default warehouse location for shipments.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Contact Name <span className="text-red-500">*</span></Label>
                      <Input
                        value={warehouseForm.fullName}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, fullName: e.target.value })}
                        placeholder="John Doe"
                        className="bg-[#111111] border-[#1f1f1f] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number <span className="text-red-500">*</span></Label>
                      <Input
                        value={warehouseForm.phoneNumber}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        placeholder="9876543210"
                        className="bg-[#111111] border-[#1f1f1f] text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Address Line 1 <span className="text-red-500">*</span></Label>
                      <Input
                        value={warehouseForm.addressLine1}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, addressLine1: e.target.value })}
                        placeholder="House/Flat No., Building Name, Street"
                        className="bg-[#111111] border-[#1f1f1f] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address Line 2 (Optional)</Label>
                      <Input
                        value={warehouseForm.addressLine2}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, addressLine2: e.target.value })}
                        placeholder="Area, Sector, Locality"
                        className="bg-[#111111] border-[#1f1f1f] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Landmark (Optional)</Label>
                      <Input
                        value={warehouseForm.landmark}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, landmark: e.target.value })}
                        placeholder="Near Metro Station"
                        className="bg-[#111111] border-[#1f1f1f] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City <span className="text-red-500">*</span></Label>
                      <Input
                        value={warehouseForm.city}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, city: e.target.value })}
                        placeholder="Mumbai"
                        className="bg-[#111111] border-[#1f1f1f] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State <span className="text-red-500">*</span></Label>
                      <select
                        value={warehouseForm.state}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, state: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-[#1f1f1f] bg-[#111111] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                      >
                        <option value="">Select State</option>
                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jammu & Kashmir">Jammu & Kashmir</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Ladakh">Ladakh</option>
                        <option value="Lakshadweep">Lakshadweep</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Puducherry">Puducherry</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>PIN Code <span className="text-red-500">*</span></Label>
                      <Input
                        value={warehouseForm.postalCode}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, postalCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        placeholder="400001"
                        className="bg-[#111111] border-[#1f1f1f] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input
                        value={warehouseForm.country}
                        disabled
                        className="bg-[#0e0e0e] border-[#1f1f1f] text-zinc-500"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="defaultPickup"
                      checked={isDefaultPickup}
                      onChange={(e) => setIsDefaultPickup(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 border"
                    />
                    <label htmlFor="defaultPickup" className="text-sm font-medium leading-none text-zinc-300">
                      Set as Default Pickup Location
                    </label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t border-white/5 pt-6">
                  <Button
                    onClick={handleWarehouseSave}
                    disabled={isSavingWarehouse}
                    className="h-9 text-sm bg-white text-black hover:bg-zinc-200 font-medium"
                  >
                    {isSavingWarehouse ? "Saving..." : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Warehouse
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* ================= SECURITY TAB ================= */}
            <TabsContent value="security">
              <Card className="bg-[#0b0b0b] border-[#1f1f1f] p-6 space-y-6">
                <h2 className="text-white font-semibold text-lg">
                  Security Settings
                </h2>

                <div className="space-y-4 max-w-md">
                  <Input
                    type="password"
                    placeholder="Current Password"
                    className="bg-[#111111] border-[#1f1f1f] text-white"
                  />
                  <Input
                    type="password"
                    placeholder="New Password"
                    className="bg-[#111111] border-[#1f1f1f] text-white"
                  />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    className="bg-[#111111] border-[#1f1f1f] text-white"
                  />

                  <Button variant="outline">Update Password</Button>
                </div>
              </Card>
            </TabsContent>

            {/* ================= BILLING / GST TAB ================= */}
            <TabsContent value="billing">
              <Card className="bg-[#0b0b0b] border-[#1f1f1f]">
                <CardHeader className="border-b border-white/5">
                  <CardTitle className="text-white">Billing & GST Information</CardTitle>
                  <CardDescription>
                    Used on invoices generated from your orders. Required for GST-compliant billing.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Business Name</Label>
                      <Input
                        value={gstForm.businessName}
                        onChange={(e) => setGstForm({ ...gstForm, businessName: e.target.value })}
                        placeholder="As per GST registration"
                        className="bg-[#111111] border-[#1f1f1f] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">GST Number</Label>
                      <Input
                        value={gstForm.gstNumber}
                        onChange={(e) => setGstForm({ ...gstForm, gstNumber: e.target.value.toUpperCase() })}
                        placeholder="22AAAAA0000A1Z5"
                        className="bg-[#111111] border-[#1f1f1f] text-white font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">PAN Number</Label>
                      <Input
                        value={gstForm.panNumber}
                        onChange={(e) => setGstForm({ ...gstForm, panNumber: e.target.value.toUpperCase() })}
                        placeholder="AAAAA0000A"
                        className="bg-[#111111] border-[#1f1f1f] text-white font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Contact Number</Label>
                      <Input
                        value={gstForm.contactNumber}
                        onChange={(e) => setGstForm({ ...gstForm, contactNumber: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="bg-[#111111] border-[#1f1f1f] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Billing Email</Label>
                      <Input
                        type="email"
                        value={gstForm.billingEmail}
                        onChange={(e) => setGstForm({ ...gstForm, billingEmail: e.target.value })}
                        placeholder="billing@yourbrand.com"
                        className="bg-[#111111] border-[#1f1f1f] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">State</Label>
                      <Input
                        value={gstForm.billingState}
                        onChange={(e) => setGstForm({ ...gstForm, billingState: e.target.value })}
                        placeholder="Maharashtra"
                        className="bg-[#111111] border-[#1f1f1f] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Pincode</Label>
                      <Input
                        value={gstForm.billingPincode}
                        onChange={(e) => setGstForm({ ...gstForm, billingPincode: e.target.value })}
                        placeholder="400001"
                        className="bg-[#111111] border-[#1f1f1f] text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Registered Address</Label>
                    <Input
                      value={gstForm.registeredAddress}
                      onChange={(e) => setGstForm({ ...gstForm, registeredAddress: e.target.value })}
                      placeholder="Full registered business address"
                      className="bg-[#111111] border-[#1f1f1f] text-white"
                    />
                  </div>
                  <Button
                    onClick={handleGstSave}
                    disabled={isSavingGst}
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    {isSavingGst ? (
                      <><Save className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="h-4 w-4 mr-2" /> Save Billing Details</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
