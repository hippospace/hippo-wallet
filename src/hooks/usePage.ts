import { useContext } from 'react';
import { PageContext } from 'contexts/PageProvider';

const usePage = () => useContext(PageContext);

export default usePage;
