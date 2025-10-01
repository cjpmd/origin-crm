import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, DollarSign, Plus, Building2, Edit } from 'lucide-react';
import { usePortfolioCompanies } from '@/hooks/usePortfolioCompanies';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';

export default function Portfolio() {
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const { companies, isLoading } = usePortfolioCompanies();

  if (isLoading) {
    return <div>Loading portfolio...</div>;
  }

  const publicCompanies = companies.filter(c => c.is_public);
  const totalMarketCap = publicCompanies.reduce((sum, c) => sum + (c.market_cap || 0), 0);
  const totalValuation = companies.reduce((sum, c) => sum + (c.valuation || 0), 0);
  const totalInvestment = companies.reduce((sum, c) => sum + (c.investment_amount || 0), 0);
  const avgOwnership = companies.reduce((sum, c) => sum + (c.ownership_percentage || 0), 0) / companies.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Companies</h1>
          <p className="text-muted-foreground">
            Monitor performance and track key metrics
          </p>
        </div>
        <Button onClick={() => navigate('/companies')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {publicCompanies.length} public · {companies.length - publicCompanies.length} private
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Market Cap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">${(totalMarketCap / 1000000000).toFixed(1)}B</div>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Public companies only</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Valuation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{formatCurrency(totalValuation)}</div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Portfolio valuation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Ownership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOwnership.toFixed(1)}%</div>
            <Progress value={avgOwnership} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Company Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {companies.map((company) => {
          return (
            <Card 
              key={company.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/companies`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{company.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {company.sectors?.name && (
                        <Badge variant="outline">{company.sectors.name}</Badge>
                      )}
                      {company.location && (
                        <Badge variant="secondary">{company.location}</Badge>
                      )}
                      {company.is_public && company.stock_ticker && (
                        <Badge variant="default">{company.stock_ticker}</Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/companies`);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {company.valuation && (
                    <div>
                      <div className="text-sm text-muted-foreground">Valuation</div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(company.valuation)}
                      </div>
                    </div>
                  )}
                  {company.investment_amount && (
                    <div>
                      <div className="text-sm text-muted-foreground">Investment</div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(company.investment_amount)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {company.ownership_percentage && (
                    <div>
                      <div className="text-sm text-muted-foreground">Ownership</div>
                      <div className="text-lg font-semibold">{company.ownership_percentage}%</div>
                    </div>
                  )}
                  {company.investment_date && (
                    <div>
                      <div className="text-sm text-muted-foreground">Investment Date</div>
                      <div className="text-sm">
                        {new Date(company.investment_date).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>

                {company.is_public && company.market_cap && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Market Cap</span>
                      <span className="font-medium">{formatCurrency(company.market_cap)}</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <Badge variant={company.status === 'Active' ? 'default' : 'secondary'}>
                    {company.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}