import { FC, useEffect, useMemo, useState } from 'react';
import './css/grid.scss';
import { useHistory } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { useDomainCache } from '../../../lib/useDomainCache';
import { Web3Provider } from '@ethersproject/providers';
import TableImage from './table-image';
import GridImage from './grid-image';
import avatar from '../../css/img/wilderavatar.png';
import { Indexed } from '@ethersproject/abi';
import { inflate } from 'node:zlib';

import StaticEmulator from '../../../lib/StaticEmulator/StaticEmulator.js';

interface GridProps {
  domain: string;
}

const Grid: FC<GridProps> = ({ domain: _domain }) => {
  const context = useWeb3React<Web3Provider>();

  const { account } = context;
  const domainStore = useDomainCache();
  const { useDomain } = domainStore;
  const { name } = useDomain(_domain);

  const history = useHistory();
  const handleCellClick = (name: any) => {
    //console.log('fire');
    history.push({
      pathname: name,
    });
  };

  const [image, setImage] = useState('');
  const [descript, setDescription] = useState(null);

  // useEffect(() => {
  //   // if statement for "base case" state varible if not set then set
  //   if (descript === null) {
  //     const ipfsreq = async () => {
  //       const ipfsLib = require('ipfs-api');
  //       const ipfsClient = new ipfsLib({
  //         host: 'ipfs.infura.io',
  //         port: 5001,
  //         protocol: 'https',
  //       });

  //       // let domain = name as any;
  //       if (name.isNothing()) return;
  //       let cid = await ipfsClient.cat(name.value.metadata.slice(21));

  //       console.log(cid + '');
  //       let desc = JSON.parse(cid).description;
  //       let img = JSON.parse(cid).image;

  //       setImage(img);
  //       setDescription(desc);
  //     };
  //     ipfsreq();
  //   }
  //   console.log('useEffect');
  // }, [descript, name, image]);
  // let images: any = [
  //   <img src={zero} alt="" />,
  //   <img src={neo} alt="" className="" />,
  //   <img src={kitty} alt="" className="" />,
  //   <img src={cybercar} alt="" className="" />,
  //   <img src={realestate} alt="" className="" />,
  // ];

  //
  // The following functions generate random numbers for mock data display
  //

  const randThreeS = () => {
    let temp =
      Math.random() > 0.5
        ? Math.floor(Math.random() * 1000).toString()
        : Math.floor(Math.random() * 100).toString();
    if (temp === '0') {
      temp = '10';
    }
    return temp;
  };

  const randPrice = () => {
    let temp = Math.floor(Math.random() * 100).toString();
    let dot = Math.floor(Math.random() * 100).toString();
    if (dot.length === 1) {
      dot = '0' + dot;
    }
    let up = Math.random() > 0.3;
    let price = `${up ? '▲' : '▼'} ${temp}.${dot}%`;
    return (
      <div style={{ color: `${up ? '#27AE60' : '#EB5757'}` }}>{price}</div>
    );
  };

  //
  //
  //

  const gridCell = (cellInput: any, i: any) => {
    return (
      <div onClick={() => handleCellClick(cellInput.name)} className="gridCell">
        <div className="gridCellContent">
          <div className="topbar">
            {/* <div className="dots">
              <div></div>
              <div></div>
              <div></div>
            </div> */}
          </div>
          <div className="name">
            <div>{cellInput.name.match(/[^.]+$/)}</div>
          </div>
          <div className="image">
            <img src={image} />
          </div>
          {/* <div className="text">
            <div>Last Traded Price</div>
            <div>Change</div>
          </div> */}
        </div>
      </div>
    );
  };

  const domain: any = true;

  const gridCells = useMemo(
    () =>
      name.isNothing()
        ? []
        : name.value.subdomains.map((key: any, i: number) => {
            return gridCell(key, i);
          }),
    [name],
  );
  if (name.isNothing()) return null;
  return (
    <div className="gridContainer">
      <div className="gridMargin">{gridCells}</div>
    </div>
  );
};

export default Grid;
