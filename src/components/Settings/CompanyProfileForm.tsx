import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { Building2 } from "lucide-react";

export function CompanyProfileForm() {
  const { profile, upsertProfile } = useCompanyProfile();
  const [formData, setFormData] = useState({
    company_name: "",
    logo_url: "",
    address: "",
    phone: "",
    email: "",
    website: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || "",
        logo_url: profile.logo_url || "",
        address: profile.address || "",
        phone: profile.phone || "",
        email: profile.email || "",
        website: profile.website || ""
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await upsertProfile(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <CardTitle>Company Profile</CardTitle>
        </div>
        <CardDescription>
          Manage your company information and branding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Your Company Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, Country"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://www.company.com"
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Company Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
