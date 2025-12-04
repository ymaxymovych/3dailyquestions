import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface CompanyIssue {
    id: string;
    name: string;
    sent: number;
    replied: number;
    lastActive: string;
    status: 'CRITICAL' | 'WARNING';
}

export function ProblematicCompanies({ companies }: { companies: CompanyIssue[] }) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Problematic Companies</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {companies.map((company) => (
                        <div
                            key={company.id}
                            className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                            <div className="space-y-1">
                                <Link
                                    href={`/internal/companies/${company.id}`}
                                    className="font-medium hover:underline"
                                >
                                    {company.name}
                                </Link>
                                <div className="text-sm text-muted-foreground">
                                    Last active: {company.lastActive}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-right">
                                    <div className="font-medium">
                                        {company.replied}/{company.sent}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Response Rate</div>
                                </div>
                                <Badge variant={company.status === 'CRITICAL' ? 'destructive' : 'secondary'}>
                                    {company.status}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
