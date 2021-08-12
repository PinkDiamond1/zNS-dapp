//- React Imports
import React, { useState } from 'react';

//- Component Imports
import { FutureButton, Image, Member, Overlay } from 'components';

//- Library Imports
import useMvpVersion from 'lib/hooks/useMvpVersion';
import { randomName, randomImage } from 'lib/Random';
import { ethers } from 'ethers';
import { tokenToUsd } from 'lib/coingecko';

//- Style Imports
import styles from './Request.module.css';

//- Type Imports
import {
	DisplayDomainRequestAndContents,
	DomainRequestAndContents,
} from 'lib/types';

//- Asset Imports
import galaxyBackground from './assets/galaxy.png';

type RequestProps = {
	request: DisplayDomainRequestAndContents;
	// @TODO Change 'yours' to 'sentByYou'
	yours?: boolean;
	onApprove: (request: DomainRequestAndContents) => void;
	onFulfill: (request: DomainRequestAndContents) => void;
	onNavigate: (domain: string) => void;
};

const Request: React.FC<RequestProps> = ({
	request,
	yours,
	onApprove,
	onFulfill,
	onNavigate,
}) => {
	////////////////////
	// Imported Hooks //
	////////////////////

	const { mvpVersion } = useMvpVersion();

	///////////
	// State //
	///////////

	const [stake, setStake] = useState(0); // Stake in USD (as state because API call is async)
	const [isLightboxOpen, setIsLightboxOpen] = useState(false); // Toggle image lightbox
	const [isModalOpen, setIsModalOpen] = useState(false); // Toggle confirmation overlay
	const isFulfilling =
		yours && request.request.approved && !request.request.fulfilled;

	// Token offer in correct format
	const tokenAmount = Number(
		ethers.utils.formatEther(request.request.offeredAmount),
	);

	///////////////
	// Functions //
	///////////////

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);
	const preview = () => setIsLightboxOpen(true);
	const confirm = () => {
		if (isFulfilling && onFulfill) onFulfill(request);
		else if (!isFulfilling && onApprove) onApprove(request);
	};
	const navigate = () => {
		if (onNavigate) onNavigate(request.request.domain);
	};

	/////////////
	// Effects //
	/////////////

	React.useEffect(() => {
		tokenToUsd('wilder-world').then((d) => {
			setStake(d as number);
		});
	}, []);

	return (
		<div
			style={{ backgroundImage: `url(${galaxyBackground})` }}
			className={`${styles.Request} border-primary border-rounded`}
		>
			{/* Image Lightbox */}
			{isLightboxOpen && (
				<Overlay
					centered
					img
					open={isLightboxOpen}
					onClose={() => setIsLightboxOpen(false)}
				>
					<div>
						<Image
							src={request.metadata.image}
							style={{
								width: 'auto',
								maxHeight: '80vh',
								maxWidth: '80vw',
								objectFit: 'contain',
								textAlign: 'center',
							}}
						/>
					</div>
				</Overlay>
			)}

			{/* Confirmation Overlay */}
			{isModalOpen && (
				<Overlay centered open onClose={closeModal}>
					<div
						className={`${styles.Confirmation} blur border-primary border-rounded`}
					>
						<h2 className="glow-text-white">Are you sure?</h2>
						<hr className="glow" />
						<p>
							{yours
								? 'This NFT is about to be seared upon the Blockchain.'
								: `This will approve the request for another user to mint 0://${request.request.domain}`}
						</p>
						<p>There's no going back.</p>
						<div className={styles.Buttons}>
							<FutureButton
								style={{ textTransform: 'uppercase' }}
								alt
								glow
								onClick={closeModal}
							>
								Cancel
							</FutureButton>
							<FutureButton
								style={{ textTransform: 'uppercase' }}
								glow
								onClick={confirm}
							>
								Continue
							</FutureButton>
						</div>
					</div>
				</Overlay>
			)}

			{/* Preview Image (Clickable) */}
			<div className={styles.Image}>
				<Image src={request.metadata.image} onClick={preview} />
			</div>

			{/* Requested Domain Info (Name, description, etc.) */}
			<div className={styles.Info}>
				<div>
					<h1 className="glow-text-white">{request.metadata.title}</h1>
					<span className={styles.Domain}>0://{request.request.domain}</span>
					<Member
						style={{ marginTop: 16 }}
						id={request.request.requestor.id}
						name={randomName(request.request.requestor.id)}
						image={randomImage(request.request.requestor.id)}
						showZna={mvpVersion === 3}
						subtext={'Creator'}
					/>
				</div>
				<div className={styles.Story}>{request.metadata.description}</div>

				{/* Stake Info */}
				<div>
					<span
						style={{
							fontWeight: 700,
							color: 'var(--color-primary-lighter-3)',
							textTransform: 'uppercase',
						}}
						className={'glow-text-blue'}
					>
						Stake Offer
					</span>
					<div className={styles.Offer}>
						<span>
							{tokenAmount.toLocaleString()} {request.contents.stakeCurrency}
						</span>
						<span>
							${Number((tokenAmount * stake).toFixed(2)).toLocaleString()} USD
						</span>
					</div>

					{/* Action Buttons */}

					{/* Fulfill */}
					{yours && request.request.approved && !request.request.fulfilled && (
						<div className={styles.Buttons}>
							<FutureButton
								style={{ textTransform: 'uppercase' }}
								glow
								onClick={openModal}
							>
								Fulfill
							</FutureButton>
						</div>
					)}

					{yours && request.request.approved && request.request.fulfilled && (
						<div className={styles.Buttons}>
							<FutureButton
								style={{ textTransform: 'uppercase' }}
								glow
								onClick={navigate}
							>
								View in ZNS
							</FutureButton>
						</div>
					)}

					{/* Approve */}
					{!yours && !request.request.approved && (
						<div className={styles.Buttons}>
							<FutureButton
								style={{ textTransform: 'uppercase' }}
								glow
								onClick={openModal}
							>
								Approve
							</FutureButton>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Request;