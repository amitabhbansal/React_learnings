import './App.css';
import FetchItems from './components/FetchItems';
//import CreateCustomer from './components/CreateCustomer';
// import FetchCustomer from './components/FetchCustomer'

function App() {
  return (
    <div className="min-h-screen bg-amber-100 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-amber-500">Boutique POS System</h1>

        {/* <FetchCustomer/> */}
        {/* <CreateCustomer /> */}
        <FetchItems />
      </div>
    </div>
  );
}

export default App;
