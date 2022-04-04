import {
	Link,
	Redirect,
	Route,
	Switch,
	useHistory,
	useRouteMatch,
} from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';

// Components
import { BidTable, ConnectWalletButton, OwnedDomainsTable } from 'containers';
import { CopyInput } from 'components';

// Library
import { ROUTES } from 'constants/routes';
import { useDidMount } from 'lib/hooks/useDidMount';
import { useNavbar } from 'lib/hooks/useNavbar';

// Styles
import styles from './Profile.module.scss';
import classNames from 'classnames/bind';
import { ArrowLeft } from 'react-feather';
const cx = classNames.bind(styles);

// Keeping these in here to reduce number of files
const r = (route: string) => {
	return ROUTES.PROFILE + route;
};

type Tab = {
	title: string;
	component: () => any;
	location: string;
};

/**
 * NOTE: Default route will always be first tab
 */
const TABS: Tab[] = [
	{
		title: 'Owned Domains',
		component: () => <OwnedDomainsTable />,
		location: ROUTES.OWNED_DOMAINS,
	},
	{
		title: 'Your Bids',
		component: () => <BidTable />,
		location: ROUTES.YOUR_BIDS,
	},
];

/**
 * User profile page for the currenctly connected user.
 * This can be adapted to work with any user
 * @returns
 */
const Profile = () => {
	const { account } = useWeb3React();

	// React-router stuff
	const { length: canGoBack, goBack, push, location } = useHistory();
	const { path } = useRouteMatch();
	const { setNavbarTitle } = useNavbar();

	useDidMount(() => {
		setNavbarTitle('Your Profile');
	});

	const onBack = () => {
		if (canGoBack) {
			goBack();
		} else {
			push(ROUTES.MARKET);
		}
	};

	return (
		<main className={styles.Container}>
			<button className={styles.Back} onClick={onBack}>
				<ArrowLeft color="white" /> <span>Back</span>
			</button>
			{account ? (
				<>
					<CopyInput className={styles.Address} value={account} />
					<nav className={styles.Nav}>
						{TABS.map((route) => (
							<Link
								className={cx({
									Selected: location.pathname === r(route.location),
								})}
								to={r(route.location)}
								data-title={route.title} // set title here for css bold trick
								replace // hitting back should take to last non-profile page
							>
								{route.title}
							</Link>
						))}
					</nav>
					<Switch>
						{TABS.map((route) => (
							<Route
								exact
								path={r(route.location)}
								component={route.component}
							/>
						))}
						<Route exact path={path}>
							<Redirect to={r(TABS[0].location)} />
						</Route>
					</Switch>
				</>
			) : (
				<div className={styles.Connect}>
					<p>Please connect a wallet to view your profile.</p>
					<ConnectWalletButton>Connect Wallet</ConnectWalletButton>
				</div>
			)}
		</main>
	);
};

export default Profile;
