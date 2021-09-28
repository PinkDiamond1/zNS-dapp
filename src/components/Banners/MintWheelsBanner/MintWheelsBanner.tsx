//- React Imports
import React from 'react';

//- Style Imports
import styles from './MintWheelsBanner.module.css';

type MintWheelsBannerProps = {
	title: string;
	label: string;
	labelBold: React.ReactNode;
	buttonText: string;
	onClick: () => void;
	style?: React.CSSProperties;
};

const MintWheelsBanner: React.FC<MintWheelsBannerProps> = ({
	title,
	label,
	labelBold,
	buttonText,
	onClick,
	style,
}) => {
	return (
		<div className={`${styles.Container}`} style={style}>
			<div className={`${styles.Background}`}></div>
			<div className={`${styles.Content}`}>
				<div className={`${styles.TextContainer}`}>
					<h2 className={`${styles.Title}`}>{title}</h2>
					<p className={`${styles.Label}`}>
						{label + ' '}
						<span>{labelBold}</span>
					</p>
				</div>

				<button className={`${styles.Button}`} onClick={onClick}>
					{buttonText + ' ↗'}
				</button>
			</div>
		</div>
	);
};

export default MintWheelsBanner;
