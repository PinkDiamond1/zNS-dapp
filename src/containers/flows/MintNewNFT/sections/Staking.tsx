/* eslint-disable react-hooks/exhaustive-deps */
//- React Imports
import React, { useState, useEffect } from 'react';

//- Type Imports
import { TokenStakeType } from '../types';

//- Style Imports
import styles from '../MintNewNFT.module.scss';

//- Component Imports
import { TextInput, FutureButton } from 'components';

type StakingProps = {
	balance: number | undefined;
	token: TokenStakeType | null;
	onContinue: (data: TokenStakeType) => void;
};

const Staking: React.FC<StakingProps> = ({ balance, token, onContinue }) => {
	const [amount, setAmount] = useState('');
	const [error, setError] = useState<string | undefined>();
	const [isValid, setIsValid] = useState<boolean>(false);

	const pressContinue = () => {
		// Validate
		const stake = Number(amount);
		if (!amount.length || stake === undefined || stake === 0)
			return setError('Please provide a stake amount');
		if (balance !== undefined && stake > balance) {
			setError('Insufficient balance');
			return;
		}
		onContinue({
			amount: parseFloat(amount),
			currency: 'LOOT',
		});
	};

	useEffect(() => {
		const stake = Number(amount);
		const valid =
			stake !== undefined &&
			balance !== undefined &&
			stake <= balance &&
			stake > 0;
		setIsValid(valid);

		if (balance !== undefined && stake > balance) {
			setError('Insufficient balance');
		} else {
			setError(undefined);
		}
	}, [amount]);

	const balanceIndicator = () => (
		<>
			<span style={{ marginBottom: 16 }} className={styles.Estimate}>
				<>
					Your Balance:{' '}
					{balance !== undefined
						? Number(balance).toLocaleString()
						: 'Loading...'}{' '}
					LOOT
				</>
			</span>
		</>
	);

	return (
		<div
			className={styles.Section}
			style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}
		>
			<p style={{ lineHeight: 1.3 }}>
				In order to mint this token in Wilder, you’ll need to put up some
				capital. You can bid what you think is a reasonable amount; if the owner
				accepts your offer, you will be able to create the token.
			</p>
			{balanceIndicator()}
			<div style={{ margin: '0 auto', position: 'relative' }}>
				<TextInput
					placeholder={'Stake amount (LOOT)'}
					onChange={(amount: string) => setAmount(amount)}
					text={amount}
					style={{ width: '215px' }}
					error={error !== undefined}
					errorText={error}
					numeric
				/>
			</div>
			<div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}>
				<FutureButton
					style={{
						margin: '0 auto 0 auto',
						width: 130,
					}}
					onClick={() => {
						if (!isValid) {
							return;
						}
						pressContinue();
					}}
					glow={isValid}
				>
					Continue
				</FutureButton>
			</div>
		</div>
	);
};

export default Staking;
