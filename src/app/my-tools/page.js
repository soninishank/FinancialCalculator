import MyToolsWorkspace from '../../components/home/MyToolsWorkspace';

export const metadata = {
    title: 'My Tools',
    description: 'Manage saved tools, recent activity, and reusable money-workflow views in one workspace.',
    alternates: {
        canonical: 'https://www.hashmatic.in/my-tools',
    },
};

export default function MyToolsPage() {
    return <MyToolsWorkspace />;
}
