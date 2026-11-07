'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Alert,
  Stepper,
  Stack,
  NumberInput,
  TextInput,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
} from '@tabler/icons-react';
import {
  CreateAreaPayload,
  getActionFieldsFromActionDefinition,
} from '@/services/areasService';
import type { FieldData, ActivationConfig } from '@/types';
import { initiateServiceConnection } from '@/services/serviceConnectionService';
import { NameStep, TriggersStep, ReactionsStep, LinksStep, ResumeStep } from '@/components/ui/area-simple-steps';
import { ArrayInput } from '@/components/ui/area-simple-steps/ArrayInput';
import { useAreaForm } from '@/hooks/useAreaForm';
import { useDraftSaver } from '@/hooks/useDraftSaver';

interface TriggerData {
  id: string;
  service: string | null;
  actionId: string | null;
  params: Record<string, unknown>;
  activationConfig?: ActivationConfig;
}

interface ReactionData {
  id: string;
  service: string | null;
  actionId: string | null;
  params: Record<string, unknown>;
}

interface LinkData {
  id: string;
  sourceId: string;
  targetId: string;
  linkType: 'chain' | 'conditional' | 'parallel' | 'sequential';
  mapping?: Record<string, string>;
  order: number;
}

interface SimpleAreaFormProps {
  mode: 'create' | 'edit';
  areaId?: string;
  currentUserId?: string | null;
  draftKey?: string;
  initialData?: {
    areaName: string;
    areaDescription: string;
    triggers: TriggerData[];
    reactions: ReactionData[];
    links: LinkData[];
  };
  onSubmit: (payload: CreateAreaPayload) => Promise<void>;
  onClearDraft?: () => void;
  hasDraft?: boolean;
}

export function SimpleAreaForm({
  mode,
  areaId,
  currentUserId,
  draftKey,
  initialData,
  onSubmit,
  onClearDraft,
  hasDraft,
}: SimpleAreaFormProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [areaName, setAreaName] = useState(initialData?.areaName || '');
  const [areaDescription, setAreaDescription] = useState(initialData?.areaDescription || '');
  const [triggers, setTriggers] = useState<TriggerData[]>(
    initialData?.triggers || [
      { id: 'trigger-initial', service: null, actionId: null, params: {}, activationConfig: { type: 'webhook' } }
    ]
  );
  const [reactions, setReactions] = useState<ReactionData[]>(
    initialData?.reactions || [
      { id: 'reaction-initial', service: null, actionId: null, params: {} }
    ]
  );
  const [links, setLinks] = useState<LinkData[]>(initialData?.links || []);

  const {
    services,
    serviceConnectionStatuses,
    actionTriggers,
    reactionActions,
    loading: servicesLoading,
    loadTriggerActions,
    loadReactionActions,
  } = useAreaForm();

  const draftData = useMemo(() => ({
    areaName,
    areaDescription,
    triggers,
    reactions,
    links,
    activeStep,
  }), [areaName, areaDescription, triggers, reactions, links, activeStep]);

  useDraftSaver(
    mode === 'create' ? (currentUserId || null) : null,
    draftKey || '',
    draftData
  );

  const sortedLinks = useMemo(() => {
    if (links.length === 0) return [];

    const linkMap = new Map<string, LinkData>();
    const dependencyGraph = new Map<string, Set<string>>(); // linkId -> set of linkIds it depends on
    links.forEach(link => {
      linkMap.set(link.id, link);
      if (!dependencyGraph.has(link.id)) {
        dependencyGraph.set(link.id, new Set());
      }
    });
    links.forEach(linkA => {
      links.forEach(linkB => {
        if (linkA.id !== linkB.id && linkA.sourceId === linkB.targetId) {
          dependencyGraph.get(linkA.id)?.add(linkB.id);
        }
      });
    });
    const sorted: LinkData[] = [];
    const inDegree = new Map<string, number>();
    links.forEach(link => {
      inDegree.set(link.id, dependencyGraph.get(link.id)?.size || 0);
    });
    const queue: string[] = [];
    inDegree.forEach((degree, linkId) => {
      if (degree === 0) {
        queue.push(linkId);
      }
    });
    queue.sort((a, b) => {
      const linkA = linkMap.get(a);
      const linkB = linkMap.get(b);
      return (linkA?.order ?? 0) - (linkB?.order ?? 0);
    });
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentLink = linkMap.get(currentId);
      if (currentLink) {
        sorted.push(currentLink);
      }
      links.forEach(link => {
        if (dependencyGraph.get(link.id)?.has(currentId)) {
          const newDegree = (inDegree.get(link.id) || 0) - 1;
          inDegree.set(link.id, newDegree);
          if (newDegree === 0) {
            // Add to queue, maintaining creation order for ties
            const insertIndex = queue.findIndex(id => {
              const qLink = linkMap.get(id);
              const currentLinkData = linkMap.get(link.id);
              return (qLink?.order ?? 0) > (currentLinkData?.order ?? 0);
            });
            if (insertIndex === -1) {
              queue.push(link.id);
            } else {
              queue.splice(insertIndex, 0, link.id);
            }
          }
        }
      });
    }
    if (sorted.length < links.length) {
      const remainingLinks = links.filter(link => !sorted.find(s => s.id === link.id));
      remainingLinks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      sorted.push(...remainingLinks);
    }

    return sorted;
  }, [links]);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setAreaName(initialData.areaName || '');
      setAreaDescription(initialData.areaDescription || '');
      if (initialData.triggers && initialData.triggers.length > 0) {
        setTriggers(initialData.triggers);
      }
      if (initialData.reactions && initialData.reactions.length > 0) {
        setReactions(initialData.reactions);
      }
      if (initialData.links && initialData.links.length > 0) {
        setLinks(initialData.links);
      }
    }
  }, [initialData, mode]);

  useEffect(() => {
    const servicesToLoad = triggers
      .filter(t => t.service)
      .map(t => t.service as string);
    const uniqueServices = [...new Set(servicesToLoad)];
    uniqueServices.forEach(service => {
      loadTriggerActions(service);
    });
  }, [triggers, loadTriggerActions]);

  const reactionServiceKeys = useMemo(() => {
    return reactions
      .map(r => r.service)
      .filter((service): service is string => service !== null);
  }, [reactions]);

  useEffect(() => {
    if (reactionServiceKeys.length > 0) {
      loadReactionActions(reactionServiceKeys);
    }
  }, [reactionServiceKeys, loadReactionActions]);

  const addTrigger = () => {
    const newId = `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setTriggers([...triggers, {
      id: newId,
      service: null,
      actionId: null,
      params: {},
      activationConfig: { type: 'webhook' }
    }]);
  };

  const removeTrigger = (id: string) => {
    if (triggers.length > 1) {
      setTriggers(triggers.filter(t => t.id !== id));
      setLinks(prevLinks => prevLinks.filter(l => l.sourceId !== id && l.targetId !== id));
    }
  };

  const addReaction = () => {
    const newId = `reaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setReactions([...reactions, {
      id: newId,
      service: null,
      actionId: null,
      params: {}
    }]);
  };

  const removeReaction = (id: string) => {
    if (reactions.length > 1) {
      setReactions(reactions.filter(r => r.id !== id));
      setLinks(prevLinks => prevLinks.filter(l => l.sourceId !== id && l.targetId !== id));
    }
  };

  const addLink = () => {
    const newId = `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.order)) : -1;
    setLinks([
      ...links,
      {
        id: newId,
        sourceId: '',
        targetId: '',
        linkType: 'chain',
        order: maxOrder + 1,
      },
    ]);
  };

  const removeLink = (linkId: string) => {
    setLinks(links.filter(l => l.id !== linkId));
  };

  const updateLink = (linkId: string, updates: Partial<LinkData>) => {
    setLinks(prevLinks =>
      prevLinks.map(l => (l.id === linkId ? { ...l, ...updates } : l))
    );
  };

  const handleConnectService = async (serviceKey: string) => {
    try {
      await initiateServiceConnection(serviceKey, window.location.href);
    } catch (error) {
      console.error('Error initiating service connection:', error);
      setError('Unable to connect the service.');
    }
  };

  const handleSubmit = async () => {
    if (!areaName) {
      setError('Please fill in all required fields.');
      return;
    }

    const invalidTriggers = triggers.filter(t => !t.service || !t.actionId);
    if (invalidTriggers.length > 0) {
      setError('All triggers must have a service and an event selected.');
      return;
    }

    const invalidReactions = reactions.filter(r => !r.service || !r.actionId);
    if (invalidReactions.length > 0) {
      setError('All reactions must have a service and an action selected.');
      return;
    }

    if (links.length > 0) {
      const invalidLinks = links.filter(l => !l.sourceId || !l.targetId);
      if (invalidLinks.length > 0) {
        setError('All links must have a source and target selected.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const triggerIdToIndex = new Map<string, number>();
      triggers.forEach((trigger, index) => {
        triggerIdToIndex.set(trigger.id, index);
      });

      const reactionIdToIndex = new Map<string, number>();
      reactions.forEach((reaction, index) => {
        reactionIdToIndex.set(reaction.id, index);
      });
      const connections = sortedLinks.map((link) => {
        let sourceServiceId = '';
        let targetServiceId = '';
        if (triggerIdToIndex.has(link.sourceId)) {
          sourceServiceId = `action_${triggerIdToIndex.get(link.sourceId)}`;
        } else if (reactionIdToIndex.has(link.sourceId)) {
          sourceServiceId = `reaction_${reactionIdToIndex.get(link.sourceId)}`;
        }
        if (triggerIdToIndex.has(link.targetId)) {
          targetServiceId = `action_${triggerIdToIndex.get(link.targetId)}`;
        } else if (reactionIdToIndex.has(link.targetId)) {
          targetServiceId = `reaction_${reactionIdToIndex.get(link.targetId)}`;
        }

        return {
          sourceServiceId,
          targetServiceId,
          linkType: link.linkType,
          mapping: link.mapping || {},
          condition: {},
          order: link.order,
        };
      });

      const payload: CreateAreaPayload = {
        name: areaName,
        description: areaDescription || undefined,
        actions: triggers.map((trigger, index) => ({
          actionDefinitionId: trigger.actionId!,
          name: `Trigger ${index + 1} - ${areaName}`,
          description: `Trigger action ${index + 1}`,
          parameters: trigger.params,
          activationConfig: trigger.activationConfig as unknown as Record<string, unknown>,
        })),
        reactions: reactions.map((reaction, index) => ({
          actionDefinitionId: reaction.actionId!,
          name: `Reaction ${index + 1} - ${areaName}`,
          description: `Reaction action ${index + 1}`,
          parameters: reaction.params,
          order: index + 1,
        })),
        links: sortedLinks.map((link) => {
          let sourceActionDefinitionId: string | undefined;
          let targetActionDefinitionId: string | undefined;
          const sourceTrigger = triggers.find(t => t.id === link.sourceId);
          if (sourceTrigger) {
            sourceActionDefinitionId = sourceTrigger.actionId || undefined;
          } else {
            const sourceReaction = reactions.find(r => r.id === link.sourceId);
            sourceActionDefinitionId = sourceReaction?.actionId || undefined;
          }
          const targetTrigger = triggers.find(t => t.id === link.targetId);
          if (targetTrigger) {
            targetActionDefinitionId = targetTrigger.actionId || undefined;
          } else {
            const targetReaction = reactions.find(r => r.id === link.targetId);
            targetActionDefinitionId = targetReaction?.actionId || undefined;
          }

          return {
            sourceActionDefinitionId: sourceActionDefinitionId!,
            targetActionDefinitionId: targetActionDefinitionId!,
            mapping: link.mapping || {},
            condition: {},
            order: link.order,
          };
        }),
        connections,
      };

      await onSubmit(payload);
      setSuccess(true);
      setTimeout(() => {
        router.push('/areas');
      }, 2000);
    } catch (err) {
      console.error(`Failed to ${mode} area:`, err);
      setError(`Failed to ${mode} AREA. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    switch (activeStep) {
      case 0:
        return areaName.trim().length > 0;
      case 1:
        return triggers.every(t => t.service && t.actionId);
      case 2:
        return reactions.every(r => r.service && r.actionId);
      case 3:
        return links.length === 0 || links.every(l => l.sourceId && l.targetId);
      default:
        return false;
    }
  };

  const renderParameterField = (
    field: FieldData,
    value: unknown,
    onChange: (value: unknown) => void
  ) => {
    const commonProps = {
      label: field.name,
      description: field.description,
      required: field.mandatory,
    };

    switch (field.type) {
      case 'number':
        return (
          <NumberInput
            {...commonProps}
            value={typeof value === 'number' ? value : undefined}
            onChange={onChange}
            placeholder={field.placeholder}
          />
        );
      case 'text':
      case 'email':
        return (
          <TextInput
            {...commonProps}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.currentTarget.value)}
            type={field.type}
            placeholder={field.placeholder}
          />
        );
      case 'datetime':
      case 'date':
      case 'time':
        return (
          <TextInput
            {...commonProps}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.currentTarget.value)}
            type={field.type === 'datetime' ? 'datetime-local' : field.type}
            placeholder={field.placeholder}
          />
        );
      case 'array':
        return <ArrayInput field={field} value={value} onChange={onChange} />;
      default:
        return (
          <TextInput
            {...commonProps}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.currentTarget.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  if (success) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconCheck size={20} />} title="Success" color="green">
          Your AREA has been {mode === 'create' ? 'created' : 'updated'} successfully! Redirecting...
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Group justify="space-between" mb="md">
            <div>
              <Title order={1}>
                {mode === 'create' ? 'Create a Simple AREA' : 'Edit AREA'}
              </Title>
              <Text c="dimmed" size="lg" mt="sm">
                {mode === 'create'
                  ? 'Create an automation in a few simple steps'
                  : 'Modify your automation in a few simple steps'
                }
              </Text>
            </div>
            <Group>
              {mode === 'create' && hasDraft && onClearDraft && (
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={onClearDraft}
                >
                  Clear Form
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  if (mode === 'edit' && areaId) {
                    router.push(`/areas/${areaId}?mode=advanced`);
                  } else {
                    router.push('/areas/new');
                  }
                }}
              >
                Advanced Mode
              </Button>
            </Group>
          </Group>
        </div>

        {error && (
          <Alert
            icon={<IconAlertCircle size={20} />}
            title="Error"
            color="red"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {Object.keys(serviceConnectionStatuses).length > 0 &&
         Object.values(serviceConnectionStatuses).every(s => !s.isConnected) &&
         services.length > 0 && (
          <Alert
            icon={<IconAlertCircle size={20} />}
            title="Disconnected Services"
            color="yellow"
          >
            Some services require a connection. You can connect them when selecting the service.
          </Alert>
        )}

        <Stepper
          active={activeStep}
          onStepClick={setActiveStep}
          allowNextStepsSelect={false}
          size="md"
        >
          <Stepper.Step
            label="Information"
            description="Name and description"
          >
            <NameStep
              areaName={areaName}
              areaDescription={areaDescription}
              onNameChange={setAreaName}
              onDescriptionChange={setAreaDescription}
            />
          </Stepper.Step>

          <Stepper.Step
            label="Triggers"
            description="When something happens"
          >
            <TriggersStep
              services={services}
              serviceConnectionStatuses={serviceConnectionStatuses}
              triggers={triggers}
              actionTriggers={actionTriggers}
              onTriggerServiceChange={(triggerId, service) => {
                setTriggers(prev => prev.map(t =>
                  t.id === triggerId
                    ? { ...t, service, actionId: null, params: {} }
                    : t
                ));
              }}
              onTriggerActionChange={(triggerId, actionId) => {
                setTriggers(prev => prev.map(t =>
                  t.id === triggerId
                    ? { ...t, actionId, params: {} }
                    : t
                ));
              }}
              onTriggerParamChange={(triggerId, paramName, value) => {
                setTriggers(prev => prev.map(t =>
                  t.id === triggerId
                    ? { ...t, params: { ...t.params, [paramName]: value } }
                    : t
                ));
              }}
              onTriggerActivationConfigChange={(triggerId, config) => {
                setTriggers(prev => prev.map(t =>
                  t.id === triggerId
                    ? { ...t, activationConfig: config }
                    : t
                ));
              }}
              onAddTrigger={addTrigger}
              onRemoveTrigger={removeTrigger}
              onConnectService={handleConnectService}
              renderParameterField={renderParameterField}
              getActionFields={(actionId) => {
                const action = actionTriggers.find(a => a.id === actionId);
                return action ? getActionFieldsFromActionDefinition(action) : [];
              }}
            />
          </Stepper.Step>

          <Stepper.Step
            label="Reactions"
            description="What should happen"
          >
            <ReactionsStep
              services={services}
              serviceConnectionStatuses={serviceConnectionStatuses}
              reactions={reactions}
              reactionActions={reactionActions}
              onReactionServiceChange={(reactionId, service) => {
                setReactions(prev => prev.map(r =>
                  r.id === reactionId
                    ? { ...r, service, actionId: null, params: {} }
                    : r
                ));
              }}
              onReactionActionChange={(reactionId, actionId) => {
                setReactions(prev => prev.map(r =>
                  r.id === reactionId
                    ? { ...r, actionId, params: {} }
                    : r
                ));
              }}
              onReactionParamChange={(reactionId, paramName, value) => {
                setReactions(prev => prev.map(r =>
                  r.id === reactionId
                    ? { ...r, params: { ...r.params, [paramName]: value } }
                    : r
                ));
              }}
              onAddReaction={addReaction}
              onRemoveReaction={removeReaction}
              onConnectService={handleConnectService}
              renderParameterField={renderParameterField}
              getActionFields={(actionId) => {
                const action = reactionActions.find(a => a.id === actionId);
                return action ? getActionFieldsFromActionDefinition(action) : [];
              }}
            />
          </Stepper.Step>

          <Stepper.Step
            label="Links"
            description="Connect actions (optional)"
          >
            <LinksStep
              triggers={triggers}
              reactions={reactions}
              links={sortedLinks}
              actionTriggers={actionTriggers}
              reactionActions={reactionActions}
              onAddLink={addLink}
              onRemoveLink={removeLink}
              onUpdateLink={updateLink}
            />
          </Stepper.Step>

          <Stepper.Completed>
            <ResumeStep
              areaName={areaName}
              areaDescription={areaDescription}
              triggers={triggers}
              reactions={reactions}
              links={sortedLinks}
              services={services}
              actionTriggers={actionTriggers}
              reactionActions={reactionActions}
            />
          </Stepper.Completed>
        </Stepper>

        <Group justify="space-between" mt="xl">
          {activeStep > 0 && (
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => setActiveStep(activeStep - 1)}
            >
              Previous
            </Button>
          )}
          {activeStep < 4 && (
            <Button
              rightSection={<IconArrowRight size={18} />}
              onClick={() => setActiveStep(activeStep + 1)}
              disabled={!canGoNext()}
              ml="auto"
            >
              Next
            </Button>
          )}
          {activeStep === 4 && (
            <Button
              onClick={handleSubmit}
              loading={loading || servicesLoading}
              ml="auto"
              color="green"
            >
              {mode === 'create' ? 'Create AREA' : 'Update AREA'}
            </Button>
          )}
        </Group>
      </Stack>
    </Container>
  );
}
