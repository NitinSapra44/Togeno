"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultShipping,
  setDefaultBilling,
  Address,
  CreateAddressData,
} from "@/services/address.service";
import { Button, Input } from "@/components/ui";
import {
  ArrowLeft,
  Plus,
  MapPin,
  Pencil,
  Trash2,
  Star,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EMPTY_FORM: CreateAddressData = {
  fullName: "",
  phoneNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state — null means form is closed; "new" means adding; string ID means editing
  const [formMode, setFormMode] = useState<"new" | string | null>(null);
  const [form, setForm] = useState<CreateAddressData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Per-address action states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [defaultingId, setDefaultingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAddresses();
      setAddresses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load addresses.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormMode("new");
  }

  function openEdit(address: Address) {
    setForm({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });
    setFormError(null);
    setFormMode(address.id);
  }

  function closeForm() {
    setFormMode(null);
    setFormError(null);
  }

  function setField(key: keyof CreateAddressData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const required: (keyof CreateAddressData)[] = ["fullName", "phoneNumber", "addressLine1", "city", "state", "postalCode", "country"];
    for (const field of required) {
      if (!form[field]?.toString().trim()) {
        setFormError(`${field.replace(/([A-Z])/g, " $1")} is required.`);
        return;
      }
    }

    try {
      setIsSaving(true);
      if (formMode === "new") {
        await createAddress({ ...form, addressLine2: form.addressLine2 || null });
      } else {
        await updateAddress(formMode as string, { ...form, addressLine2: form.addressLine2 || null });
      }
      closeForm();
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // keep address in list on failure
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(id: string, type: "shipping" | "billing") {
    try {
      setDefaultingId(id + type);
      const updated = type === "shipping" ? await setDefaultShipping(id) : await setDefaultBilling(id);
      setAddresses((prev) =>
        prev.map((a) => {
          if (type === "shipping") return { ...a, isDefaultShipping: a.id === updated.id };
          return { ...a, isDefaultBilling: a.id === updated.id };
        })
      );
    } catch {
      // silent
    } finally {
      setDefaultingId(null);
    }
  }

  return (
    <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-10 pb-24">
      <button
        onClick={() => router.push("/consumer/profile")}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Saved Addresses</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your delivery and billing addresses.</p>
        </div>
        {formMode === null && (
          <Button
            onClick={openNew}
            className="bg-white text-black hover:bg-gray-200 font-bold rounded-xl h-10 px-4 text-sm active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New
          </Button>
        )}
      </div>

      {/* ADD / EDIT FORM */}
      <AnimatePresence>
        {formMode !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">
                {formMode === "new" ? "New Address" : "Edit Address"}
              </h2>
              <button onClick={closeForm} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name" value={form.fullName} onChange={(v) => setField("fullName", v)} disabled={isSaving} />
                <Field label="Phone Number" value={form.phoneNumber} onChange={(v) => setField("phoneNumber", v)} disabled={isSaving} />
              </div>
              <Field label="Address Line 1" value={form.addressLine1} onChange={(v) => setField("addressLine1", v)} disabled={isSaving} />
              <Field label="Address Line 2 (optional)" value={form.addressLine2 ?? ""} onChange={(v) => setField("addressLine2", v)} disabled={isSaving} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" value={form.city} onChange={(v) => setField("city", v)} disabled={isSaving} />
                <Field label="State" value={form.state} onChange={(v) => setField("state", v)} disabled={isSaving} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Postal Code" value={form.postalCode} onChange={(v) => setField("postalCode", v)} disabled={isSaving} />
                <Field label="Country" value={form.country} onChange={(v) => setField("country", v)} disabled={isSaving} />
              </div>

              {formError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-10 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                  onClick={closeForm}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-white text-black hover:bg-gray-200 font-bold active:scale-95 transition-all"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : formMode === "new" ? "Save Address" : "Update Address"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIST */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <Button onClick={load} variant="ghost" className="border border-white/10 text-gray-400 rounded-xl">
            Retry
          </Button>
        </div>
      ) : addresses.length === 0 && formMode === null ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/10 rounded-2xl text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6 text-gray-500" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No addresses saved</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">Add a delivery address to speed up checkout.</p>
          <Button
            onClick={openNew}
            className="bg-white text-black hover:bg-gray-200 font-bold rounded-xl h-10 px-6 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Address
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {addresses.map((addr) => (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0f0f10] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold text-white">{addr.fullName}</p>
                      {addr.isDefaultShipping && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Default Shipping
                        </span>
                      )}
                      {addr.isDefaultBilling && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Default Billing
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                      <br />
                      {addr.city}, {addr.state} {addr.postalCode}
                      <br />
                      {addr.country}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{addr.phoneNumber}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEdit(addr)}
                      disabled={formMode !== null}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-40"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      disabled={deletingId === addr.id}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors disabled:opacity-40"
                    >
                      {deletingId === addr.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>

                {/* Default badges row */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/5 flex-wrap">
                  {!addr.isDefaultShipping && (
                    <button
                      onClick={() => handleSetDefault(addr.id, "shipping")}
                      disabled={defaultingId === addr.id + "shipping"}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-blue-400 transition-colors disabled:opacity-40"
                    >
                      {defaultingId === addr.id + "shipping"
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Star className="w-3 h-3" />
                      }
                      Set as default shipping
                    </button>
                  )}
                  {!addr.isDefaultShipping && !addr.isDefaultBilling && (
                    <span className="text-gray-700 text-xs">·</span>
                  )}
                  {!addr.isDefaultBilling && (
                    <button
                      onClick={() => handleSetDefault(addr.id, "billing")}
                      disabled={defaultingId === addr.id + "billing"}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-purple-400 transition-colors disabled:opacity-40"
                    >
                      {defaultingId === addr.id + "billing"
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <CheckCircle2 className="w-3 h-3" />
                      }
                      Set as default billing
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 bg-[#0d0d0f] border border-white/10 hover:border-white/20 focus-visible:border-white/30 text-white placeholder:text-gray-600 rounded-xl text-sm"
        disabled={disabled}
      />
    </div>
  );
}
