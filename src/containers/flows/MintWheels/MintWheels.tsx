/*
 This container is for the Mint Wheels flow. It should be
 replaced by a more generic container for minting procedurally
 generated NFTs in the future.
 */

// React Imports
import { useEffect, useState } from 'react';

// Step Imports
import Loading from './steps/Loading/Loading';
import Info from './steps/Info/Info';
import SelectAmount from './steps/SelectAmount/SelectAmount';
import InsufficientFunds from './steps/InsufficientFunds/InsufficientFunds';

// Configuration
import { Stage, Step, TransactionData } from './types';
import { EthPerWheel } from './helpers';

// Style Imports
import styles from './MintWheels.module.css';

type MintWheelsProps = {
	balanceEth?: number;
	dropStage?: Stage;
	onClose: () => void;
	isUserWhitelisted?: boolean;
	maxPurchasesPerUser?: number;
	numberPurchasedByUser?: number;
	userId?: string;
	wheelsTotal?: number;
	wheelsMinted?: number;
	onSubmitTransaction: (data: TransactionData) => void;
};

const MintWheels = (props: MintWheelsProps) => {
	//////////////////
	// State & Data //
	//////////////////

	const [step, setStep] = useState<Step>(Step.Info);

	const [transactionStatus, setTransactionStatus] = useState<string>(
		'Pending Wallet Approval',
	);
	const [transactionError, setTransactionError] = useState<
		string | undefined
	>();

	///////////////
	// Functions //
	///////////////

	const onContinueFromInfo = () => {
		if (props.balanceEth !== undefined) {
			if (props.balanceEth < EthPerWheel) {
				setStep(Step.InsufficientFunds);
			} else {
				setStep(Step.SelectAmount);
			}
		} else {
			setStep(Step.CheckingBalance);
		}
	};

	useEffect(() => {
		if (props.balanceEth !== undefined && step === Step.CheckingBalance) {
			setStep(Step.SelectAmount);
		}
	}, [props.balanceEth]);

	const submitTransaction = (numWheels: number) => {
		// Switch to "pending wallet approval" step
		setStep(Step.PendingWalletApproval);
		setTransactionError(undefined);

		const statusCallback = (status: string) => {
			setTransactionStatus(status);
		};

		const errorCallback = (error: string) => {
			setStep(Step.SelectAmount);
			setTransactionError(error);
		};

		const finishedCallback = () => {
			props.onClose();
		};

		const data: TransactionData = {
			numWheels,
			statusCallback,
			errorCallback,
			finishedCallback,
		};
		props.onSubmitTransaction(data);
	};

	const onBack = () => {
		if (step === Step.InsufficientFunds || step === Step.SelectAmount) {
			setStep(Step.Info);
		}
	};

	const getFlowSection = () => {
		if (props.dropStage === undefined) {
			return;
		}
		if (step === Step.Info) {
			return (
				<Info
					dropStage={props.dropStage!}
					isUserWhitelisted={props.isUserWhitelisted}
					isWalletConnected={props.userId !== undefined}
					maxPurchasesPerUser={props.maxPurchasesPerUser}
					numberPurchasedByUser={props.numberPurchasedByUser}
					onContinue={onContinueFromInfo!}
					wheelsMinted={props.wheelsMinted!}
					wheelsTotal={props.wheelsTotal!}
				/>
			);
		}
		if (step === Step.SelectAmount) {
			return (
				<SelectAmount
					balanceEth={props.balanceEth!}
					error={transactionError}
					maxPurchasesPerUser={props.maxPurchasesPerUser!}
					numberPurchasedByUser={props.numberPurchasedByUser!}
					onBack={onBack}
					onContinue={submitTransaction}
					remainingWheels={props.wheelsTotal! - props.wheelsMinted!}
				/>
			);
		}
		if (step === Step.CheckingBalance) {
			return <Loading text={'Checking your ETH balance'} />;
		}
		if (step === Step.PendingWalletApproval) {
			return <Loading text={transactionStatus} />;
		}
		if (step === Step.InsufficientFunds) {
			return <InsufficientFunds onDismiss={props.onClose} />;
		}
	};

	////////////
	// Render //
	////////////

	return (
		<div className={`${styles.Container} border-primary border-rounded`}>
			{/* Head section */}
			<section className={styles.Header}>
				<h1 className="glow-text-white">Mint Your Wheels</h1>
				<span className="glow-text-white">
					Your ride in the metaverse awaits
				</span>
				<hr />
			</section>
			{props.dropStage === undefined && (
				<Loading text={'Loading Wheels Drop'} />
			)}
			{getFlowSection()}
		</div>
	);
};

export default MintWheels;
