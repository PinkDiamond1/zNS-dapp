// React imports
import { useState } from 'react';

// Library imports
import constants from './CancelBid.constants';
import { Step } from './CancelBid.types';
import useBidData from './hooks/useBidData';
import useCancelBid from './hooks/useCancelBid';
import { useUpdateEffect } from 'lib/hooks/useUpdateEffect';

// Component imports
import { Wizard } from 'components';
import Details from './steps/Details';

type CancelBidContainerProps = {
	auctionId: string;
	domainId: string;
	onSuccess: () => void;
	onClose: () => void;
};

export const CancelBid = ({
	auctionId,
	domainId,
	onSuccess,
	onClose,
}: CancelBidContainerProps) => {
	const { bid, bidData, refetch, isLoading } = useBidData(domainId, auctionId);
	const { cancel } = useCancelBid();

	const [currentStep, setCurrentStep] = useState<Step>(Step.LoadingData);
	const [error, setError] = useState<string | undefined>();

	useUpdateEffect(() => {
		if (isLoading) {
			setCurrentStep(Step.LoadingData);
		} else {
			setCurrentStep(Step.Details);
		}
	}, [isLoading]);

	const onFinish = () => {
		onSuccess();
		onClose();
	};

	const onCancelBid = async () => {
		setCurrentStep(Step.Cancelling);
		try {
			await cancel(bid!);
			setCurrentStep(Step.Success);
		} catch (e) {
			setError(e.message);
			setCurrentStep(Step.Confirmation);
		}
	};

	const onBack = () => {
		setError(undefined);
		setCurrentStep(Step.Details);
	};

	const steps = {
		[Step.LoadingData]: <Wizard.Loading message={constants.TEXT_LOADING} />,
		[Step.Details]: bidData ? (
			<Details
				bidData={bidData}
				onClose={onClose}
				onNext={() => setCurrentStep(Step.Confirmation)}
			/>
		) : (
			<Wizard.Confirmation
				message={constants.TEXT_FAILED_TO_LOAD}
				primaryButtonText="Retry"
				onClickPrimaryButton={refetch}
				secondaryButtonText="Close"
				onClickSecondaryButton={onClose}
			/>
		),
		[Step.Confirmation]: (
			<Wizard.Confirmation
				error={error}
				message={constants.TEXT_CONFIRM_CANCEL}
				primaryButtonText={'Cancel Bid'}
				onClickPrimaryButton={onCancelBid}
				secondaryButtonText={'Back'}
				onClickSecondaryButton={onBack}
			/>
		),
		[Step.Cancelling]: (
			<Wizard.Loading message={constants.TEXT_CANCELLING_BID} />
		),
		[Step.Success]: (
			<Wizard.Confirmation
				message={constants.TEXT_SUCCESS}
				primaryButtonText={'Finish'}
				onClickPrimaryButton={onFinish}
			/>
		),
	};

	return <Wizard header={'Cancel Bid'}>{steps[currentStep]}</Wizard>;
};

export default CancelBid;
