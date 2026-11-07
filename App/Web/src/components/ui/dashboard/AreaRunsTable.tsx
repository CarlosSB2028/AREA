import { Badge, Anchor } from '@mantine/core';
import { DataTable, Column } from '../DataTable';

interface AreaRun {
  id: number;
  areaName: string;
  user: string;
  timestamp: string;
  status: string;
  duration: string;
}

interface AreaRunsTableProps {
  areaRuns: AreaRun[];
}

export function AreaRunsTable({ areaRuns }: AreaRunsTableProps) {
  const columns: Column<AreaRun>[] = [
    {
      key: 'areaName',
      label: 'Area Name',
    },
    {
      key: 'user',
      label: 'User',
      render: (run) => (
        <Anchor href={`/profil/${run.user.toLowerCase().replace(' ', '-')}`} c="blue" underline="hover">
          {run.user}
        </Anchor>
      ),
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (run) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
          {run.timestamp}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (run) => (
        <Badge
          color={
            run.status === 'success' ? 'green' :
            run.status === 'failed' ? 'red' :
            'yellow'
          }
          variant="light"
        >
          {run.status}
        </Badge>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (run) => (
        <span style={{ fontFamily: 'monospace' }}>
          {run.duration}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      title="Recent Area Runs"
      data={areaRuns}
      columns={columns}
      itemsPerPage={10}
      showAddButton={false}
      showActions={false}
    />
  );
}