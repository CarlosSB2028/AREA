'use client';

import { useState } from 'react';
import { PillsInput, Pill, Combobox, CheckIcon, Group, useCombobox } from '@mantine/core';
import Image from 'next/image';
import { ServiceFilterProps } from '../../../types';

export default function ServiceFilter({ services, value, onChange }: ServiceFilterProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const [search, setSearch] = useState('');

  const handleValueSelect = (val: string) =>
    onChange(
      value.includes(val) ? value.filter((v) => v !== val) : [...value, val]
    );

  const handleValueRemove = (val: string) =>
    onChange(value.filter((v) => v !== val));

  const values = value.map((id) => {
    const service = services.find((s) => s.id === id);
    return (
      <Pill key={id} withRemoveButton onRemove={() => handleValueRemove(id)}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {service?.logo && <Image data-testid="service-logo" src={service.logo} alt={service.name} width={16} height={16} />}
          <span>{service?.name || id}</span>
        </span>
      </Pill>
    );
  });

  const options = services
    .filter((service) => service.name.toLowerCase().includes(search.trim().toLowerCase()))
    .map((service) => (
      <Combobox.Option value={service.id} key={service.id} active={value.includes(service.id)}>
        <Group gap="sm">
          {value.includes(service.id) ? <CheckIcon size={12} /> : null}
          {service.logo && <Image src={service.logo} alt={service.name} width={16} height={16} />}
          <span>{service.name}</span>
        </Group>
      </Combobox.Option>
    ));

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
      <style>
        {`
          .scroll-container::-webkit-scrollbar {
            height: 2px;
          }
          .scroll-container {
            scrollbar-width: thin;
          }
        `}
      </style>
      <Combobox.DropdownTarget>
        <PillsInput onClick={() => combobox.openDropdown()}>
          <Pill.Group style={{ overflowX: 'auto', flexWrap: 'nowrap' }} className="scroll-container">
            {values}
            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder="Search services"
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Backspace' && search.length === 0 && value.length > 0) {
                    event.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length > 0 ? options : <Combobox.Empty>Nothing found...</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}