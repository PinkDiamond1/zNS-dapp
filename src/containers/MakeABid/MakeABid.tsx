//- React Imports
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
//- Web3 Imports
import { useWeb3React } from '@web3-react/core'; // Wallet data
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider'; // Wallet data
//- Library Imports
import { Domain, Metadata, Bid } from 'lib/types';
import { useBidProvider } from 'lib/providers/BidProvider';
import { getMetadata } from 'lib/metadata';
import { toFiat } from 'lib/currency';
import { getRelativeDomainPath } from 'lib/utils/domains';
import { useCurrencyProvider } from 'lib/providers/CurrencyProvider';
import { useZnsContracts } from 'lib/contracts';
import { ethers } from 'ethers';
import { ERC20 } from 'types';
//- Component Imports
import {
	StepBar,
	FutureButton,
	TextButton,
	Image,
	TextInput,
	Member,
	Overlay,
} from 'components';
import { BidList } from 'containers';

//- Style Imports
import styles from './MakeABid.module.css';

type MakeABidProps = {
	domain: Domain;
	onBid: () => void;
};

enum Steps {
	Bid,
	Approve,
	Confirm,
}

const MakeABid: React.FC<MakeABidProps> = ({ domain, onBid }) => {
	//- Bid hooks
	const { getBidsForDomain, placeBid } = useBidProvider();

	// React-router-dom
	const history = useHistory();

	// Wild to usd
	const { wildPriceUsd } = useCurrencyProvider();

	///////////
	// State //
	///////////

	const [step, setStep] = useState<Steps>(Steps.Bid);
	const [bid, setBid] = useState<string>('');

	const [bids, setBids] = useState<Bid[] | undefined>([]);
	const [currentHighestBid, setCurrentHighestBid] = useState<Bid | undefined>();
	const [currentHighestBidUsd, setCurrentHighestBidUsd] = useState<
		number | undefined
	>();
	const [domainMetadata, setDomainMetadata] = useState<Metadata | undefined>();
	const [error, setError] = useState('');
	const [wildBalance, setWildBalance] = useState(0);
	const [hasApprovedTokenTransfer, setHasApprovedTokenTransfer] = useState<
		boolean | undefined
	>();
	const [isApprovalInProgress, setIsApprovalInProgress] = useState(false);
	const [isAllBidsModalOpen, setIsAllBidsModalOpen] = useState(false);

	// Loading States
	const [hasBidDataLoaded, setHasBidDataLoaded] = useState(false);
	const [isBidPending, setIsBidPending] = useState(false);
	const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
	const [isMetamaskWaiting, setIsMetamaskWaiting] = useState(false);
	const [statusText, setStatusText] = useState<string>('Processing bid');

	//- Web3 Wallet Data
	const walletContext = useWeb3React<Web3Provider>();
	const { account, chainId } = walletContext;

	const znsContracts = useZnsContracts()!;
	const zAuctionAddress = znsContracts.zAuction.address;
	const wildContract: ERC20 = znsContracts.wildToken;

	const isBidValid =
		(Number(bid) && Number(bid) <= wildBalance && Number(bid) > 0) === true;

	///////////////
	// Functions //
	///////////////

	const navigateTo = (domain: string) => {
		const relativeDomain = getRelativeDomainPath(domain);
		history.push(relativeDomain);
	};

	const showAllBidsModal = () => setIsAllBidsModalOpen(true);
	const hideAllBidsModal = () => setIsAllBidsModalOpen(false);

	const formSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		continueBid();
	};

	const approveZAuction = async () => {
		try {
			setIsApprovalInProgress(true);
			const tx = await wildContract.approve(
				zAuctionAddress,
				ethers.constants.MaxUint256,
			);
			await tx.wait();
			setHasApprovedTokenTransfer(true);
			setIsApprovalInProgress(false);
		} catch (e) {
			console.warn('zAuction approval failed');
			setIsApprovalInProgress(false);
		}
	};

	const continueBid = async () => {
		// Validate bid
		const bidAmount = Number(bid);
		if (!bidAmount) return setError('Invalid bid');
		if (bidAmount <= 0) return setError('Invalid bid');

		if (bidAmount > wildBalance)
			return setError('You have insufficient WILD to make this bid');

		setError('');
		setStep(Steps.Approve);
	};

	const makeBid = async () => {
		// Get bid
		const bidAmount = Number(bid);
		if (!bidAmount) return;

		const onStep = (status: string) => {
			setStatusText(status);
		};

		// Send bid to hook
		setIsMetamaskWaiting(true);
		setError('');
		try {
			await placeBid(domain, bidAmount, onStep);
			onBid();
		} catch (e) {
			setError(e && (e.toString() ?? ''));
		}
	};

	const checkAllowance = async () => {
		setIsCheckingAllowance(true);
		const allowance = await wildContract.allowance(account!, zAuctionAddress);
		const bidAsWei = ethers.utils.parseEther(bid).toString();
		const needsApproving = allowance.lt(bidAsWei);

		await new Promise((r) => setTimeout(r, 1500)); // Add a timeout so we can show the user a message for UX
		if (hasApprovedTokenTransfer) {
			setIsCheckingAllowance(false);
			setStep(Steps.Confirm);
		} else {
			setIsCheckingAllowance(false);
			setHasApprovedTokenTransfer(!needsApproving);
		}
	};

	/////////////
	// Effects //
	/////////////

	useEffect(() => {
		if (!account) {
			return;
		}

		setIsMetamaskWaiting(false);
		setStep(Steps.Bid); // Reset to start of flow if account changes
		setHasApprovedTokenTransfer(undefined);

		const fetchTokenBalance = async () => {
			const balance = await wildContract.balanceOf(account);
			setWildBalance(parseInt(ethers.utils.formatEther(balance), 10));
		};
		fetchTokenBalance();
	}, [wildContract, account]);

	useEffect(() => {
		if (hasApprovedTokenTransfer && step === Steps.Approve) {
			setStep(Steps.Confirm);
		}
	}, [hasApprovedTokenTransfer]);

	useEffect(() => {
		if (step === Steps.Approve) {
			checkAllowance();
		}
	}, [step]);

	useEffect(() => {
		let isSubscribed = true;

		const loadDomainData = async () => {
			const metadata = await getMetadata(domain.metadata);
			if (!metadata) return;

			if (isSubscribed) {
				setDomainMetadata(metadata);
			}
		};

		loadDomainData();

		return () => {
			isSubscribed = false;
		};
	}, [domain, wildPriceUsd]);

	useEffect(() => {
		let isSubscribed = true;

		const getCurrentHighestBid = async () => {
			// Get highest bid
			const allBids = await getBidsForDomain(domain);

			if (!allBids || allBids.length === 0) return;
			const highestBid = allBids.reduce(function (prev, current) {
				return prev.amount > current.amount ? prev : current;
			});

			if (isSubscribed) {
				setHasBidDataLoaded(true);
				setBids(allBids);
				setCurrentHighestBid(highestBid);
				setCurrentHighestBidUsd(highestBid.amount * wildPriceUsd);
			}
		};

		getCurrentHighestBid();

		return () => {
			isSubscribed = false;
		};
	}, [domain, wildPriceUsd]);

	/////////////////////
	// React Fragments //
	/////////////////////

	const modals = () => (
		<>
			{isAllBidsModalOpen && bids !== undefined && (
				<Overlay open onClose={hideAllBidsModal} centered>
					<BidList bids={bids} wildPriceUsd={wildPriceUsd} />
				</Overlay>
			)}
		</>
	);

	const header = () => (
		<>
			<div className={styles.Header}>
				<h1 className={`glow-text-white`}>Place A Bid</h1>
			</div>
		</>
	);

	const nft = () => (
		<div className={styles.NFT}>
			<Image
				style={{ objectFit: 'contain', position: 'absolute', zIndex: 2 }}
				src={domainMetadata?.image}
			/>
		</div>
	);

	const highestBid = () => (
		<>
			{hasBidDataLoaded && currentHighestBid && (
				<>
					<span className="glow-text-white">
						{/* @todo change dp amount */}
						{Number(currentHighestBid.amount).toLocaleString()} WILD
					</span>
					<br />
					{currentHighestBidUsd && currentHighestBidUsd > 0 && (
						<span className="glow-text-white">
							(${toFiat(currentHighestBidUsd)} USD)
						</span>
					)}
					{bids !== undefined && bids.length > 0 && (
						<TextButton onClick={showAllBidsModal} className={styles.ViewAll}>
							View all bids
						</TextButton>
					)}
				</>
			)}
			{hasBidDataLoaded && !currentHighestBid && (
				<>
					<span className="glow-text-white">No bids found</span>
				</>
			)}
			{!hasBidDataLoaded && (
				<>
					<span className="glow-text-white">Loading...</span>
				</>
			)}
		</>
	);

	const details = () => (
		<div className={styles.Details}>
			<h2 className="glow-text-white">{domainMetadata?.title}</h2>
			<span>0://{domain.name}</span>
			<div className={styles.Price}>
				<h3 className="glow-text-blue">Highest Bid</h3>
				{highestBid()}
			</div>
			<Member
				id={currentHighestBid?.bidderAccount || ''}
				name={'not yet implemented'}
				image={'not yet implemented'}
				subtext={'Creator'}
			/>
		</div>
	);

	const estimation = () => {
		const isBidValid = !Number.isNaN(parseInt(bid));
		const bidString = isBidValid
			? Number((parseInt(bid) * wildPriceUsd).toFixed(2)).toLocaleString()
			: '0';

		return (
			<>
				<span className={styles.Estimate}>Approx. ${bidString} USD</span>
			</>
		);
	};

	const bidStep = () => (
		<>
			{modals()}
			<div
				className={styles.Section}
				style={{ display: 'flex', padding: '0 37.5px' }}
			>
				{nft()}
				{details()}
			</div>
			<div className={styles.InputWrapper}>
				{wildBalance > (currentHighestBid?.amount || 0) && (
					<>
						<p className="glow-text-blue">Enter the amount you wish to bid:</p>
						<span style={{ marginBottom: 8 }} className={styles.Estimate}>
							Your Balance: {Number(wildBalance).toLocaleString()} WILD
						</span>
						<form onSubmit={formSubmit}>
							<TextInput
								onChange={(text: string) => setBid(text)}
								placeholder="Bid amount (WILD)"
								error={error.length > 0}
								errorText={error}
								numeric
								text={bid}
								style={{ width: 268, margin: '0 auto' }}
							/>
						</form>
						{estimation()}
						<FutureButton
							style={{
								height: 36,
								borderRadius: 18,
								textTransform: 'uppercase',
								margin: '32px auto 0 auto',
							}}
							loading={isBidPending}
							onClick={continueBid}
							glow={isBidValid}
						>
							Continue
						</FutureButton>
					</>
				)}
				{wildBalance <= (currentHighestBid?.amount || 0) && (
					<>
						<p className={styles.Error}>
							You don't have enough WILD to bid on this NFT
						</p>
						<span className={styles.Estimate}>
							Your Balance: {Number(wildBalance).toLocaleString()} WILD
						</span>
					</>
				)}
			</div>
		</>
	);

	const approveStep = () => {
		return (
			<div
				className={styles.Section}
				style={{
					display: 'flex',
					flexDirection: 'column',
					padding: '0 37.5px',
				}}
			>
				{!isMetamaskWaiting && !isApprovalInProgress && !isCheckingAllowance && (
					<>
						{!hasApprovedTokenTransfer && (
							<>
								<p style={{ lineHeight: '21px' }}>
									Before placing bids, you need to approve zAuction to access
									your WILD tokens in case your bid is accepted.
								</p>
								<FutureButton
									glow
									alt
									style={{
										height: 36,
										borderRadius: 18,
										textTransform: 'uppercase',
										margin: '16px auto 0 auto',
									}}
									onClick={approveZAuction}
								>
									Approve zAuction
								</FutureButton>
							</>
						)}
					</>
				)}
				{isCheckingAllowance && (
					<>
						<div className={styles.Loading}>
							<div className={styles.Spinner}></div>
						</div>
						<p className={styles.Wait}>Checking status of zAuction approval</p>
					</>
				)}
				{isMetamaskWaiting && (
					<>
						<div className={styles.Loading}>
							<div className={styles.Spinner}></div>
						</div>
						<p className={styles.Wait}>Hold tight while we process your bid</p>
					</>
				)}
				{isApprovalInProgress && (
					<>
						<div className={styles.Loading}>
							<div className={styles.Spinner}></div>
						</div>
						<p className={styles.Wait}>zAuction approval in progress</p>
					</>
				)}
			</div>
		);
	};

	const confirmStep = () => (
		<div
			className={styles.Section}
			style={{
				display: 'flex',
				flexDirection: 'column',
				padding: '0 37.5px',
			}}
		>
			{!isMetamaskWaiting && (
				<>
					{hasApprovedTokenTransfer && (
						<>
							<p style={{ textAlign: 'center', marginTop: 24 }}>
								You are about to place a{' '}
								<b className="glow-text-white">
									{Number(bid).toLocaleString()} WILD
								</b>{' '}
								bid for <b className="glow-text-white">0://{domain.name}</b>
							</p>
							<FutureButton
								glow
								style={{
									height: 36,
									borderRadius: 18,
									textTransform: 'uppercase',
									margin: '16px auto 0 auto',
								}}
								onClick={makeBid}
							>
								Place Bid
							</FutureButton>
						</>
					)}
				</>
			)}
			{isMetamaskWaiting && (
				<>
					<div className={styles.Loading}>
						<div className={styles.Spinner}></div>
					</div>
					<p className={styles.Wait}>{statusText}</p>
				</>
			)}
			{error && (
				<p
					className={styles.Error}
					style={{ textAlign: 'center', marginTop: 24 }}
				>
					{error}
				</p>
			)}
		</div>
	);

	return (
		<div className={`${styles.Container} border-primary border-rounded blur`}>
			{header()}
			<StepBar
				step={step + 1}
				steps={['Choose Bid', 'Approve', 'Confirm Bid']}
				onNavigate={(i: number) => setStep(i)}
			/>
			{step === Steps.Bid && bidStep()}
			{step === Steps.Approve && approveStep()}
			{step === Steps.Confirm && confirmStep()}
		</div>
	);
};

export default MakeABid;