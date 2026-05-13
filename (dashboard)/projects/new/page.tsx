"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";

const PROPERTY_TYPES = ["apartment", "villa", "townhouse", "commercial", "chalet", "duplex", "penthouse"];

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [developer, setDeveloper] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("apartment");
  const [startingPrice, setStartingPrice] = useState("");
  const [downPayment, setDownPayment] = useState("10");
  const [installmentYears, setInstallmentYears] = useState("8");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [availableUnits, setAvailableUnits] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [landingPage, setLandingPage] = useState("");
  const [uspsInput, setUspsInput] = useState("");
  const [usps, setUsps] = useState<string[]>([]);
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);

  function addUsp() {
    const v = uspsInput.trim();
    if (!v) return;
    setUsps([...usps, v]);
    setUspsInput("");
  }
  function removeUsp(i: number) {
    setUsps(usps.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("users").select("company_id").eq("id", user.id).single();

    if (!profile?.company_id) {
      toast({ title: "No company", variant: "error" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("projects").insert({
      company_id: profile.company_id,
      name: name.trim(),
      developer_name: developer.trim() || null,
      location: location.trim() || null,
      property_type: propertyType,
      starting_price: startingPrice ? parseInt(startingPrice) : null,
      down_payment_pct: downPayment ? parseInt(downPayment) : null,
      installment_years: installmentYears ? parseInt(installmentYears) : null,
      delivery_date: deliveryDate.trim() || null,
      available_units: availableUnits ? parseInt(availableUnits) : null,
      whatsapp_number: whatsapp.trim() || null,
      landing_page_url: landingPage.trim() || null,
      usps,
      target_audience: audience ? { description: audience } : {},
      is_active: true,
    });

    setLoading(false);
    if (error) {
      toast({ title: "Could not create project", description: error.message, variant: "error" });
      return;
    }
    toast({ title: "Project created 🏗", variant: "success" });
    router.push("/projects");
    router.refresh();
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <PageHeader
        tag="New project"
        title="Add a project"
        subtitle="Each project becomes a target for AI-generated campaigns."
        action={
          <Link href="/projects" className="lp-btn-ghost">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h3 className="font-display font-bold mb-4">Basic info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Project name *</Label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Elysium Compound" />
            </div>
            <div>
              <Label>Developer</Label>
              <Input value={developer} onChange={(e) => setDeveloper(e.target.value)} placeholder="Line Developments" />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Sheikh Zayed" />
            </div>
            <div>
              <Label>Property type</Label>
              <Select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Available units</Label>
              <Input type="number" value={availableUnits} onChange={(e) => setAvailableUnits(e.target.value)} placeholder="120" />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-display font-bold mb-4">Pricing & payment plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Starting price (EGP)</Label>
              <Input type="number" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} placeholder="4500000" />
            </div>
            <div>
              <Label>Down payment %</Label>
              <Input type="number" min="0" max="100" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />
            </div>
            <div>
              <Label>Installment years</Label>
              <Input type="number" min="0" max="20" value={installmentYears} onChange={(e) => setInstallmentYears(e.target.value)} />
            </div>
            <div className="sm:col-span-3">
              <Label>Delivery date</Label>
              <Input value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} placeholder="Q4 2027" />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-display font-bold mb-4">Unique selling points</h3>
          <p className="text-xs text-[#7a8099] mb-3">
            Add 3–6 USPs. The AI uses these directly in ad copy.
          </p>
          <div className="flex gap-2 mb-3">
            <Input
              value={uspsInput}
              onChange={(e) => setUspsInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUsp())}
              placeholder="e.g. Smart-home features"
            />
            <Button type="button" onClick={addUsp} variant="secondary">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {usps.map((u, i) => (
              <span key={i} className="inline-flex items-center gap-2 bg-[#181c24] border border-[#222632] rounded-md px-2.5 py-1 text-xs">
                {u}
                <button type="button" onClick={() => removeUsp(i)} className="text-[#7a8099] hover:text-[#ff4757]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {usps.length === 0 && (
              <span className="text-xs text-[#7a8099] italic">No USPs added yet</span>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-display font-bold mb-4">Contact & targeting</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>WhatsApp number</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+201000000000" />
            </div>
            <div>
              <Label>Landing page URL</Label>
              <Input value={landingPage} onChange={(e) => setLandingPage(e.target.value)} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <Label>Target audience description</Label>
              <Textarea
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Egyptian families, age 30-50, upper-middle income, looking for premium compound living…"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/projects" className="lp-btn-ghost">Cancel</Link>
          <Button type="submit" loading={loading} size="lg">
            Create project <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
