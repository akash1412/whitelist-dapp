import './App.css';
import { providers, Contract } from 'ethers';
import Web3Modal from 'web3modal';
import { useEffect, useRef, useState } from 'react';
import ABI from './ContractABI.json';
const WHITELIST_CONTRACT_ADDRESS = '0x3681d5C4835274C19F907430ACEBcECBD9e6816b';

const abi = ABI.abi;

function App() {
	const web3modalRef = useRef();

	const [walletConnected, setWalletConnected] = useState(false);
	const [loading, setLoading] = useState(false);
	const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
	const [joinedWhitelist, setJoinedWhitelist] = useState(false);

	const getProviderOrSigner = async (needSigner = false) => {
		const provider = await web3modalRef.current.connect();
		const web3Provider = new providers.Web3Provider(provider);

		const { chainId } = await web3Provider.getNetwork();

		if (chainId !== 4) {
			window.alert('Unsupported Network,Change the network to Rinkeby');
			throw new Error('Change network to Rinkeby');
		}

		if (needSigner) {
			const signer = web3Provider.getSigner();

			return signer;
		}

		return web3Provider;
	};

	const getNumberOfWhitelisted = async () => {
		try {
			const provider = await getProviderOrSigner();

			const whitelistContract = new Contract(
				WHITELIST_CONTRACT_ADDRESS,
				abi,
				provider
			);

			const _numberOfWhitelisted =
				await whitelistContract.numAddressesWhitelisted();

			console.log(_numberOfWhitelisted);

			setNumberOfWhitelisted(_numberOfWhitelisted);

			return _numberOfWhitelisted;
		} catch (error) {
			console.error(error);
		}
	};

	const addAddressToWhitelist = async () => {
		const signer = await getProviderOrSigner(true);

		const whitelistContract = new Contract(
			WHITELIST_CONTRACT_ADDRESS,
			abi,
			signer
		);

		const tx = await whitelistContract.addAddressToWhitelist();

		setLoading(true);
		await tx.wait();

		setLoading(false);
		const value = await getNumberOfWhitelisted();
		console.log(value);
		setJoinedWhitelist(true);
	};

	const checkIfAddressIsWhitelisted = async () => {
		const signer = await getProviderOrSigner(true);
		const signerAddress = await signer.getAddress();

		const whitelistContract = new Contract(
			WHITELIST_CONTRACT_ADDRESS,
			abi,
			signer
		);

		const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
			signerAddress
		);

		setJoinedWhitelist(_joinedWhitelist);
	};

	const connectWallet = async () => {
		try {
			await getProviderOrSigner();
			setWalletConnected(true);

			checkIfAddressIsWhitelisted();
			const value = await getNumberOfWhitelisted();
			console.log({ value });
		} catch (error) {
			console.error(error);
		}
	};

	const renderButton = () => {
		if (walletConnected) {
			if (joinedWhitelist) {
				return <div>Thanks for joining the Whitelist!</div>;
			} else if (loading) {
				return <button>Loading...</button>;
			} else {
				return (
					<button onClick={addAddressToWhitelist}>Join the Whitelist</button>
				);
			}
		} else {
			return <button onClick={connectWallet}>Connect your wallet</button>;
		}
	};

	useEffect(() => {
		if (!walletConnected) {
			web3modalRef.current = new Web3Modal({
				network: 'rinkeby',
				providerOptions: {},
				disableInjectedProvider: false,
			});
			connectWallet();
		}
	}, [walletConnected]);

	return (
		<div className='App'>
			<div>
				<div>
					<h1>Welcome to Crypto Devs!</h1>
					<div>Its an NFT collection for developers in Crypto.</div>
					<div>{numberOfWhitelisted} have already joined the Whitelist</div>
					{renderButton()}
				</div>
				<div>
					<img src='./crypto-devs.svg' />
				</div>
				<button onClick={getNumberOfWhitelisted}>
					Get number of joined memebers
				</button>
			</div>

			<footer>Made with &#10084; by Crypto Devs</footer>
		</div>
	);
}

export default App;
