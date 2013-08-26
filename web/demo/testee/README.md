**WAMP Testcases**
____________

# 3 Remote Procedure Calls

## 3.1 Argument and Return Types

### 3.1.1 Scalar Value Echo - Numbers

Echo back a scalar value of number type. The value MUST roundtrip exactly.

*Signature*

     (value|number) -> result|number

     value:   The value to be echo'ed back.
     result:  The echo'ed value.

Each of the following endpoints is tested with all test values from below.

#### Tested Endpoints

 * `http://api.testsuite.wamp.ws/case/3.1.1#1`
 * `http://api.testsuite.wamp.ws/case/3.1.1#2`
 * `http://api.testsuite.wamp.ws/case/3.1.1#3`
 * `http://api.testsuite.wamp.ws/case/3.1.1#4`

#### Tested Values

Zero as value:

       0

Each value from the following series of positive integers:

       [2^7-1, 2^8-1, 2^15-1, 2^16-1, 2^31-1, 2^32-1, 2^63-1, 2^64-1]

Each value from the following series of negative integers:

       [-2^7, -2^15, -2^31, -2^63]

Each of the following floating point numbers:

       [0, 0.1, 0.125, 0.2, ... FIXME]
