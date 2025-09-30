import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, DollarSign, Plus, Building2 } from 'lucide-react';
import { mockPortfolioCompanies, mockKPIs } from '@/lib/mockData';
import { PortfolioCompany, PortfolioKPI } from '@/types';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Portfolio() {
  const [companies] = useState<PortfolioCompany[]>(mockPortfolioCompanies);
  const [kpis] = useState<PortfolioKPI[]>(mockKPIs);

  const getCompanyKPIs = (companyId: string) => {
    return kpis.find(kpi => kpi.company_id === companyId);
  };

  const publicCompanies = companies.filter(c => c.is_public);
  const totalMarketCap = publicCompanies.reduce((sum, c) => sum + (c.market_cap || 0), 0);
  const totalPortfolioValue = kpis.reduce((sum, kpi) => sum + (kpi.revenue || 0), 0);
  const totalEmployees = kpis.reduce((sum, kpi) => sum + (kpi.headcount || 0), 0);
  const avgESGScore = kpis.reduce((sum, kpi) => sum + (kpi.esg_score || 0), 0) / kpis.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Companies</h1>
          <p className="text-muted-foreground">
            Monitor performance and track key metrics
          </p>
        </div>
        <Button>
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
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg ESG Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgESGScore.toFixed(0)}/100</div>
            <Progress value={avgESGScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Company Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {companies.map((company) => {
          const companyKPIs = getCompanyKPIs(company.id);
          
          return (
            <Card key={company.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{company.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {company.sector && (
                        <Badge variant="outline">{company.sector}</Badge>
                      )}
                      {company.geography && (
                        <Badge variant="secondary">{company.geography}</Badge>
                      )}
                      {company.is_public && company.stock_ticker && (
                        <Badge variant="default">{company.stock_ticker}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    Invested: {company.investment_date ? 
                      new Date(company.investment_date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {companyKPIs && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(companyKPIs.revenue || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">EBITDA</div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(companyKPIs.ebitda || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">ARR</div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(companyKPIs.arr || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Headcount</div>
                        <div className="text-lg font-semibold flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {companyKPIs.headcount || 0}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">ESG Score</span>
                        <span className="font-medium">{companyKPIs.esg_score}/100</span>
                      </div>
                      <Progress value={companyKPIs.esg_score || 0} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}