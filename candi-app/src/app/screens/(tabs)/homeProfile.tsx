  import * as React from 'react';
  import { HomeBackground } from '../../../components/HomeProfile/HomeBackground';
  import { ContentContainer } from '../../../components/HomeProfile/ContentContainer';
  import { ProfileCard } from '../../../components/HomeProfile/ProfileCard';
  import { LabelsRow } from '../../../components/HomeProfile/LabelsRow';
  import { Separator } from '../../../components/HomeProfile/Separator';
  import { AdvancedSettings } from '../../../components/HomeProfile/AdvancedSettings';
import { AdvancedLinks } from '@/components/HomeProfile/AdvancedLinks';

  export default function HomeScreen() {
    return (
      <HomeBackground onSettingsPress={() => console.log('⚙️ Configurações clicadas')}>
        <ContentContainer>
          <ProfileCard
            name="João da Silva"
            username="@joaosilva"
            userType="Paciente oncológico"
            onFirePress={() => console.log('🔥 Fire')}
            onBrushPress={() => console.log('✏️ Brush')}
          />

          <LabelsRow labels={['leucemia', '29/01/2007', 'joao@silva']} />

          <Separator />

          <AdvancedSettings />
       <AdvancedLinks
  links={[
    { title: 'Contatos de Emergência  >' }, 
    { title: 'Ajuda', onPress: () => console.log('Ajuda clicado') },
    { title: 'Sobre', onPress: () => console.log('Sobre clicado') },
  ]}
/>

        </ContentContainer>
      </HomeBackground>
    );
  }
