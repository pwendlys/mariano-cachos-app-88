
import React from 'react';
import AppointmentsTab from '@/components/AppointmentsTab';
import { useSupabaseCashFlow } from '@/hooks/useSupabaseCashFlow';

const AppointmentsTabWrapper = () => {
  const { 
    appointments, 
    loading, 
    updateAppointmentCollectionStatus 
  } = useSupabaseCashFlow();

  return (
    <AppointmentsTab
      appointments={appointments}
      onUpdateCollectionStatus={updateAppointmentCollectionStatus}
      loading={loading}
    />
  );
};

export default AppointmentsTabWrapper;
