import { Chains } from '@/lib/chains';
import { cn } from '@/lib/utils';
import { SupportedChains } from '@/types/chains';
import { TProtocol } from '@/types/types';
import { Base64Icon } from '../common/base64-icon';
import { ChainIcon } from '../common/chain-icon';

export const commingChains: { address: string; chain: SupportedChains; name: string }[] = [
  {
    address: '',
    chain: 'evm|42161',
    name: 'Arbitrum'
  },
  {
    address: '',
    chain: 'evm|8453',
    name: 'Base'
  },
  {
    address: '',
    chain: 'evm|10',
    name: 'Optimism'
  },
  {
    address: '',
    chain: 'evm|137',
    name: 'Polygon PoS'
  },
  {
    address: '',
    chain: 'solana|1',
    name: 'Solana'
  },
  {
    address: '',
    chain: 'evm|234485942',
    name: 'Starknet'
  }
];

export const SelectTokens = ({
  protocols
}: {
  protocols?: TProtocol[];
}) => {
  return (
    protocols?.map(({ scalar_address, asset, chains, avatar }) => {
      const newChains = [...chains!, ...commingChains!];

      return {
        groupLabel: (
          <div className='flex items-center gap-2'>
            <Base64Icon url={avatar} className='size-6' />
            <span className='font-semibold text-base'>{asset?.symbol}</span>
          </div>
        ),
        key: scalar_address || '',
        items:
          newChains
            // ?.filter((c) => c.chain !== asset?.chain)
            .map(({ name, chain, address }) => ({
              value: `${asset?.symbol}-${chain}`,
              label: (
                <ChainIcon
                  chain={chain as SupportedChains}
                  showName
                  customName={name}
                  classNames={{
                    icon: 'size-5',
                    name: 'text-base',
                    wrapper: cn({
                      'opacity-50': !address,
                      'cursor-not-allowed': !address
                    })
                  }}
                />
              ),
              hideValue: name || Chains[chain as SupportedChains]?.name
            })) || []
      };
    }) || []
  );
};
