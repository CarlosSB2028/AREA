
import { Button, Paper, Stepper, Group } from '@mantine/core';
import { useState, useCallback, useEffect } from 'react';
import SetupStep from './SetupStep';
import ConfigureStep from './ConfigureStep';
import ActivationConfigStep from './ActivationConfigStep';
import FinishStep from './FinishStep';
import { InfoServiceCardProps, ServiceData } from '../../../types';
import { getActionDefinitionById } from '../../../services/areasService';

export default function InfoServiceCard({ service, onServiceChange }: InfoServiceCardProps) {
    const [activeStep, setActiveStep] = useState(0);
    const [showActivationStep, setShowActivationStep] = useState(true);

    useEffect(() => {
        if (service.actionDefinitionId && !service.selectedAction) {
            getActionDefinitionById(service.actionDefinitionId).then((actionDef) => {
                const updatedService = {
                    ...service,
                    selectedAction: actionDef
                };
                onServiceChange?.(updatedService);
                setShowActivationStep(true);
            }).catch(console.error);
        } else if (!service.actionDefinitionId) {
            setShowActivationStep(true);
        }
    }, [service.actionDefinitionId, service.selectedAction, onServiceChange, service]);

    const maxSteps = showActivationStep ? 3 : 2;

    const handleServiceChange = useCallback((updatedService: ServiceData) => {
        onServiceChange?.(updatedService);
    }, [onServiceChange]);

    const handleFieldsChange = useCallback((fields: Record<string, unknown>) => {
        const updatedService = { ...service, fields };
        onServiceChange?.(updatedService);
    }, [onServiceChange, service]);

    const nextStep = () => setActiveStep((current) => (current < maxSteps ? current + 1 : current));
    const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

    return (
        <Paper p="md" shadow="sm">
            <Stepper active={activeStep}>
                <Stepper.Step label="Setup" description="Configure service">
                    <SetupStep service={service} onServiceChange={handleServiceChange} />
                </Stepper.Step>
                <Stepper.Step label="Configure" description="Set up connections">
                    <ConfigureStep service={service} onFieldsChange={handleFieldsChange} />
                </Stepper.Step>
                {showActivationStep && (
                    <Stepper.Step label="Activation" description="Set trigger mode">
                        <ActivationConfigStep service={service} onServiceChange={handleServiceChange} />
                    </Stepper.Step>
                )}
                <Stepper.Step label="Finish/Tests" description="Finalize and test">
                    <FinishStep service={service} />
                </Stepper.Step>
            </Stepper>

            <Group justify="center" mt="xl">
                <Button variant="default" onClick={prevStep} disabled={activeStep === 0}>
                    Back
                </Button>
                {activeStep < maxSteps && (
                <Button onClick={nextStep}>
                    Next step
                </Button>
                )}
            </Group>
        </Paper>
    );
}