
import React from 'react';
import AppointmentsTab from '@/components/AppointmentsTab';
import { useSupabaseCashFlow } from '@/hooks/useSupabaseCashFlow';

const AppointmentsTabWrapper = () => {
  const { 
    appointments, 
    loading, 
    updateCollectionStatus 
  } = useSupabaseCashFlow();

  return (
    <AppointmentsTab
      appointments={appointments}
      onUpdateCollectionStatus={updateCollectionStatus}
      loading={loading}
    />
  );
};

export default AppointmentsTabWrapper;
