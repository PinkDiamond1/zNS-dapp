//- React imports
import React, { useState } from 'react';

//- Style Imports
import styles from './PreviewCard.module.css';

//- Library Imports
import { randomName, randomImage } from 'lib/Random';
import { useHistory } from 'react-router-dom';

//- Component Imports
import { FutureButton, Image, Member, Overlay } from 'components';
import { Maybe } from 'lib/types';

type PreviewCardProps = {
	children?: React.ReactNode;
	creatorId: string;
	description: string;
	disabled: Maybe<boolean>;
	domain: string;
	image: string;
	isLoading: boolean;
	mvpVersion: number;
	name: string;
	onButtonClick: () => void;
	onImageClick?: () => void;
	ownerId: string;
	style?: React.CSSProperties;
};

const PreviewCard: React.FC<PreviewCardProps> = ({
	children,
	creatorId,
	description,
	disabled,
	domain,
	image,
	isLoading,
	mvpVersion,
	name,
	onButtonClick,
	onImageClick,
	ownerId,
	style,
}) => {
	//////////////////
	// State & Data //
	//////////////////

	const history = useHistory();
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);

	///////////////
	// Functions //
	///////////////

	const buttonClick = () => {
		if (disabled || !onButtonClick) return;
		onButtonClick();
	};

	const openNftView = () => {
		history.push({
			pathname: domain,
			search: '?view',
		});
	};

	const openImagePreview = () => {
		setIsPreviewOpen(true);
	};

	const closeImagePreview = () => {
		setIsPreviewOpen(false);
	};

	///////////////
	// Fragments //
	///////////////

	const modals = () => (
		<Overlay centered img open={isPreviewOpen} onClose={closeImagePreview}>
			<Image
				src={image ?? ''}
				style={{
					width: 'auto',
					maxHeight: '80vh',
					maxWidth: '80vw',
					objectFit: 'contain',
					textAlign: 'center',
				}}
			/>
		</Overlay>
	);

	const body = () => (
		<div className={styles.Body}>
			<div>
				<h5>{name ? name : domain.split('/')[1]}</h5>
				<span className={styles.Domain}>0://wilder.{domain.substring(1)}</span>
				<p>{description}</p>
			</div>
			<div className={styles.Members}>
				{/* TODO: Switch these to Member component */}
				<Member
					id={creatorId}
					name={randomName(creatorId)}
					image={randomImage(creatorId)}
					subtext={'Creator'}
				/>
				<Member
					id={ownerId}
					name={randomName(ownerId)}
					image={randomImage(ownerId)}
					subtext={'Owner'}
				/>
			</div>
		</div>
	);

	const buy = () => (
		<div className={styles.Buy}>
			{mvpVersion === 1 && (
				<>
					<FutureButton glow={disabled !== true} onClick={buttonClick}>
						MAKE A BID
					</FutureButton>
					<FutureButton
						glow
						alt
						onClick={openNftView}
						style={{ marginTop: 24 }}
					>
						View Domain
					</FutureButton>
				</>
			)}
			{mvpVersion === 3 && (
				<div>
					<FutureButton
						glow
						onClick={buttonClick}
						style={{ height: 36, width: 118, borderRadius: 30 }}
					>
						BUY
					</FutureButton>
					<span className={`glow-text-white`}>
						W1.56 <span className={`glow-text-blue`}>($8,000)</span>
					</span>
					<span className={`glow-text-blue`}>Last Offer</span>
				</div>
			)}
		</div>
	);

	////////////
	// Render //
	////////////

	return (
		<>
			{modals()}
			<div
				className={`${styles.PreviewCard} border-primary border-rounded blur`}
				style={style ? style : {}}
			>
				{isLoading && (
					<div className={styles.Loading}>
						<div className={styles.Spinner}></div>
					</div>
				)}
				<>
					<div
						className={styles.Preview}
						style={{ opacity: isLoading ? 0 : 1 }}
					>
						<div
							className={`${styles.Asset} ${
								mvpVersion === 3 ? styles.MVP3Asset : ''
							}`}
							onClick={openImagePreview}
						>
							<Image style={{ objectFit: 'contain' }} src={image} />
						</div>
						{body()}
						{buy()}
					</div>
					{children && mvpVersion === 3 && (
						<>
							<hr className="glow" style={{ opacity: isLoading ? 0 : 1 }} />
							<div
								className={styles.Children}
								style={{ opacity: isLoading ? 0 : 1 }}
							>
								{children}
							</div>
						</>
					)}
				</>
			</div>
		</>
	);
};

export default PreviewCard;