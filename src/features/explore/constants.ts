import { UtilityList } from '@/lib/utils';
import { ECrossChainStatus } from './models';

export const CROSS_CHAIN_STATUS = new UtilityList<{
  label: string;
  value: ECrossChainStatus;
  className?: string;
}>([
  {
    label: 'Pending',
    value: ECrossChainStatus.PENDING,
    className: 'bg-pending'
  },
  {
    label: 'Verifying',
    value: ECrossChainStatus.VERIFYING,
    className: 'bg-primary'
  },
  {
    label: 'Approved',
    value: ECrossChainStatus.APPROVED
  },
  {
    label: 'Signing',
    value: ECrossChainStatus.SIGNING
  },
  {
    label: 'Executing',
    value: ECrossChainStatus.EXECUTING,
    className: 'bg-executing'
  },
  {
    label: 'Success',
    value: ECrossChainStatus.SUCCESS,
    className: 'bg-success'
  },
  {
    label: 'Failed',
    value: ECrossChainStatus.FAILED,
    className: 'bg-failed'
  },
  {
    label: 'Cancelled',
    value: ECrossChainStatus.CANCELLED
  },
  {
    label: 'Deleted',
    value: ECrossChainStatus.DELETED
  }
]);
