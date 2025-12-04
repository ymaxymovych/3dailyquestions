'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Plus, UserPlus } from 'lucide-react';
import wizardApi from '@/lib/wizardApi';
import { toast } from 'sonner';

interface TeamStepProps {
    userRole: 'MANAGER' | 'EMPLOYEE' | 'ADMIN';
    departmentId?: string;
    onComplete: () => void;
}

export function TeamStep({ userRole, departmentId, onComplete }: TeamStepProps) {
    const [mode, setMode] = useState<'JOIN' | 'CREATE'>(userRole === 'MANAGER' ? 'CREATE' : 'JOIN');
    const [teams, setTeams] = useState<any[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [newTeamName, setNewTeamName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (departmentId) {
            fetchTeams();
        }
    }, [departmentId]);

    const fetchTeams = async () => {
        try {
            const { data } = await wizardApi.get(`/departments/${departmentId}/teams`);
            setTeams(data || []);
        } catch (error) {
            console.error('Failed to fetch teams', error);
        }
    };

    const handleCreateTeam = async () => {
        if (!newTeamName) return;
        setLoading(true);
        try {
            const { data } = await wizardApi.post('/teams', {
                name: newTeamName,
                departmentId,
            });
            toast.success('Team created!');
            // Auto-join the creator
            await wizardApi.post(`/teams/${data.id}/join`);
            onComplete();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create team');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinTeam = async () => {
        if (!selectedTeamId) return;
        setLoading(true);
        try {
            await wizardApi.post(`/teams/${selectedTeamId}/join`);
            toast.success('Joined team!');
            onComplete();
        } catch (error) {
            console.error(error);
            toast.error('Failed to join team');
        } finally {
            setLoading(false);
        }
    };

    if (!departmentId) {
        return (
            <div className="text-center p-6">
                <p className="text-muted-foreground">Please select a department in the previous step first.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center mb-6">
                <Users className="w-12 h-12 mx-auto text-blue-500 mb-2" />
                <h3 className="text-xl font-semibold">
                    {userRole === 'MANAGER' ? 'Setup Your Team' : 'Join Your Team'}
                </h3>
                <p className="text-muted-foreground text-sm">
                    {userRole === 'MANAGER'
                        ? 'Create a team to manage your direct reports.'
                        : 'Select the team you work with daily.'}
                </p>
            </div>

            {userRole === 'MANAGER' && (
                <div className="flex gap-2 mb-4 p-1 bg-slate-100 rounded-lg">
                    <button
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'CREATE' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
                        onClick={() => setMode('CREATE')}
                    >
                        Create New
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'JOIN' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
                        onClick={() => setMode('JOIN')}
                    >
                        Join Existing
                    </button>
                </div>
            )}

            {mode === 'CREATE' ? (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Team Name</Label>
                        <Input
                            placeholder="e.g. Outbound SDRs"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                        />
                    </div>
                    <Button
                        className="w-full"
                        onClick={handleCreateTeam}
                        disabled={loading || !newTeamName}
                    >
                        {loading ? 'Creating...' : 'Create Team'}
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select Team</Label>
                        <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a team..." />
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map((team) => (
                                    <SelectItem key={team.id} value={team.id}>
                                        {team.name}
                                    </SelectItem>
                                ))}
                                {teams.length === 0 && (
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        No teams found in this department.
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        className="w-full"
                        onClick={handleJoinTeam}
                        disabled={loading || !selectedTeamId}
                    >
                        {loading ? 'Joining...' : 'Join Team'}
                    </Button>
                </div>
            )}
        </div>
    );
}
