//- React imports
import React, { useState, useEffect } from 'react';

//- Style Imports
import CopyInput from '../CopyInput/CopyInput.js';
import ProfileStyle from './Profile.module.css';

//- Component Imports
import {
	FutureButton,
	Image,
	RequestTable,
	TextButton,
	Overlay,
} from 'components';
import { Request } from 'containers';

//- Library Imports
import { randomName, randomImage } from 'lib/Random';
import useMvpVersion from 'lib/hooks/useMvpVersion';
import {
	useRequestsMadeByAccount,
	useRequestsForOwnedDomains,
} from 'lib/hooks/useDomainRequestsSubgraph';

//- Type Imports
import { DisplayDomainRequest, DomainRequest } from 'lib/types';

type ProfileProps = {
	id: string;
	// TODO: Change yours
	yours?: boolean;
};

const Profile: React.FC<ProfileProps> = ({ id, yours }) => {
	const { mvpVersion } = useMvpVersion();

	const yourRequests = useRequestsMadeByAccount(id).requests;
	const requestsForYou = useRequestsForOwnedDomains(id).requests;
	const [requestData, setRequestData] = useState<DisplayDomainRequest[]>([]);

	const [selected, setSelected] = useState('requestsFor');

	const selectedCss = {
		borderBottom: '1px solid #E0BAFF',
		fontWeight: 400,
	};

	const defaultCss = {
		fontWeight: 400,
		color: 'white',
	};

	///////////////
	// Functions //
	///////////////

	const requestsBy = () => {
		setSelected('requestsBy');
	};
	const requestsFor = () => {
		setSelected('requestsFor');
	};

	/////////////
	// Effects //
	/////////////

	useEffect(() => {
		let requests: DomainRequest[];
		if (selected === 'requestsBy') {
			requests = yourRequests?.domainRequests || [];
		} else {
			const r = requestsForYou?.domains.map((d) => d.requests);
			if (r && r.length) requests = r.reduce((a, b) => a.concat(b));
			else requests = [];
		}

		if (!requests) return;

		if (!requests.length) {
			setRequestData([]);
		}

		if (requests.length) {
			// Store Request Contents data
			const data: DisplayDomainRequest[] = [];
			// Get request contents from IPFS
			const fetchableRequest = requests.filter((d) => d.requestUri);

			for (var i = 0; i < fetchableRequest.length; i++) {
				const r = fetchableRequest[i];
				fetch(r.requestUri)
					.then((d) => d.json())
					.then((d) => {
						d.domainName = r.domain;
						data.push(d);
						if (data.length === fetchableRequest.length) {
							setRequestData(data);
						}
					});
			}
		}
	}, [selected]);

	return (
		<div
			className={`${ProfileStyle.profile} blur border-primary border-rounded`}
		>
			<h1 className={`glow-text-white`}>Profile</h1>
			<div className={ProfileStyle.body}>
				{/* Hide DP for now */}
				{mvpVersion === 3 && (
					<div className={ProfileStyle.First}>
						<div style={{ height: 160 }}>
							<Image className={ProfileStyle.dp} src={randomImage(id)} />
						</div>
						<span className={`${ProfileStyle.endpoint} glow-text-blue`}>
							0://wilder.{randomName(id).toLowerCase().split(' ').join('.')}
						</span>
					</div>
				)}

				<div className={ProfileStyle.Second}>
					{/* Hide profile data for now */}
					{mvpVersion === 3 && (
						<>
							<span className={`${ProfileStyle.name} glow-text-blue`}>
								{randomName(id)}
							</span>
							<p>
								Hey I’m {randomName(id)} and I like staring into the night sky
								and imagining myself in another galaxy. I’m so passionate about
								space travel that I spend the majority of my time making
								animated short films about it. With the magic of CGI, I can make
								worlds and journeys so real that I can almost taste the
								synthetic beef that comes out of the assembler!
								<br />
								<br />
								Join me on one or all of my journeys, I welcome you aboard!
							</p>{' '}
						</>
					)}
					<CopyInput value={id} />
				</div>
			</div>
			<div className={ProfileStyle.Sections}>
				<TextButton
					onClick={requestsFor}
					selected={selected === 'requestsFor'}
					style={selected === 'requestsFor' ? selectedCss : defaultCss}
				>
					Offers Made To You
				</TextButton>
				<TextButton
					onClick={requestsBy}
					selected={selected === 'requestsBy'}
					style={selected === 'requestsBy' ? selectedCss : defaultCss}
				>
					Offers You've Made
				</TextButton>
				{/* <TextButton toggleable={true}>Offers</TextButton> */}
			</div>
			<RequestTable yours={selected === 'requestsBy'} requests={requestData} />
		</div>
	);
};

export default Profile;
