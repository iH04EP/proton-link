// export library
export * from './index-module'

// default export is Link class for convenience
import {Link} from './index-module'
export default Link

// expose dependencies
export * from '@bloks/signing-request'
export * from '@greymass/eosio'
