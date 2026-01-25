import HubWorkspace from '../../components/hub/HubWorkspace';

export const metadata = {
    title: 'Financial Hub Dashboard',
    description: 'A structured financial workspace with separate views for overview diagnostics, planning, and Money OS operations.',
    alternates: {
        canonical: 'https://www.hashmatic.in/hub',
    },
};

export default function HubPage() {
    return <HubWorkspace />;
}
