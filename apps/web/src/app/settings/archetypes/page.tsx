'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Briefcase, Target, AlertCircle, TrendingUp } from 'lucide-react';

interface RoleArchetype {
    id: string;
    code: string;
    name: string;
    level: string;
    description: string | null;
    mission: string | null;
    typicalTasks: string[] | null;
    antiPatterns: string[] | null;
    departmentArchetype: {
        id: string;
        code: string;
        name: string;
        description: string | null;
    };
    kpis: Array<{
        id: string;
        code: string;
        name: string;
        unit: string;
        direction: string;
        frequency: string;
    }>;
}

export default function ArchetypesPage() {
    const [archetypes, setArchetypes] = useState<RoleArchetype[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState<string>('all');

    useEffect(() => {
        fetchArchetypes();
    }, []);

    const fetchArchetypes = async () => {
        try {
            const response = await fetch('/api/archetypes');
            if (response.ok) {
                const data = await response.json();
                setArchetypes(data);
            }
        } catch (error) {
            console.error('Failed to fetch archetypes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group archetypes by department
    const archetypesByDept = archetypes.reduce((acc, archetype) => {
        const deptName = archetype.departmentArchetype.name;
        if (!acc[deptName]) {
            acc[deptName] = [];
        }
        acc[deptName].push(archetype);
        return acc;
    }, {} as Record<string, RoleArchetype[]>);

    const departments = Object.keys(archetypesByDept);

    // Filter archetypes
    const filteredArchetypes = archetypes.filter((archetype) => {
        const matchesSearch =
            searchQuery === '' ||
            archetype.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            archetype.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDept =
            selectedDept === 'all' || archetype.departmentArchetype.name === selectedDept;

        return matchesSearch && matchesDept;
    });

    const filteredByDept = filteredArchetypes.reduce((acc, archetype) => {
        const deptName = archetype.departmentArchetype.name;
        if (!acc[deptName]) {
            acc[deptName] = [];
        }
        acc[deptName].push(archetype);
        return acc;
    }, {} as Record<string, RoleArchetype[]>);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-muted-foreground">Loading archetypes...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Role Archetypes Library</h1>
                <p className="text-muted-foreground mt-2">
                    Global role templates with missions, typical tasks, and anti-patterns. Use these as a foundation for creating company-specific job roles.
                </p>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search archetypes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Tabs value={selectedDept} onValueChange={setSelectedDept}>
                    <TabsList>
                        <TabsTrigger value="all">All ({archetypes.length})</TabsTrigger>
                        {departments.map((dept) => (
                            <TabsTrigger key={dept} value={dept}>
                                {dept} ({archetypesByDept[dept].length})
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Archetypes Grid */}
            <div className="grid gap-6">
                {Object.keys(filteredByDept).map((deptName) => (
                    <div key={deptName}>
                        <h2 className="text-2xl font-semibold mb-4">{deptName}</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {filteredByDept[deptName].map((archetype) => (
                                <Card key={archetype.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Briefcase className="h-5 w-5" />
                                                    {archetype.name}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {archetype.description}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline">{archetype.level}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Mission */}
                                        {archetype.mission && (
                                            <div>
                                                <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                                                    <Target className="h-4 w-4 text-blue-500" />
                                                    <span>Mission</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground italic">
                                                    "{archetype.mission}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Typical Tasks */}
                                        {archetype.typicalTasks && archetype.typicalTasks.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                    <span>Typical Tasks</span>
                                                </div>
                                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                                    {archetype.typicalTasks.slice(0, 5).map((task, idx) => (
                                                        <li key={idx}>{task}</li>
                                                    ))}
                                                    {archetype.typicalTasks.length > 5 && (
                                                        <li className="text-xs">
                                                            +{archetype.typicalTasks.length - 5} more...
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Anti-patterns */}
                                        {archetype.antiPatterns && archetype.antiPatterns.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                                    <span>Anti-patterns (What to Avoid)</span>
                                                </div>
                                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                                    {archetype.antiPatterns.map((pattern, idx) => (
                                                        <li key={idx}>{pattern}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* KPIs Count */}
                                        <div className="pt-3 border-t">
                                            <div className="text-xs text-muted-foreground">
                                                {archetype.kpis.length} KPI{archetype.kpis.length !== 1 ? 's' : ''} defined
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {filteredArchetypes.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No archetypes found matching your search.
                </div>
            )}
        </div>
    );
}
