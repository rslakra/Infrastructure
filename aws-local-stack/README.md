# Python

---

The ```Python``` repository helps in the learning of the python language.


## Folder Structure Conventions

---

```
    /
    ├── basic                   # The basic python
    ├── include                 # The include module
    ├── libs                    # The libs module
    ├── module                  # The name of the module
    └── README.md
```


# Building Application

---

## Create Virtual Env
```shell
python3 -m pip install virtualenv
python3 -m venv venv
```

## Activate ```venv```

```source``` is Linux/macOS command and doesn't work in Windows.

- Windows

    ```shell
    venv\Scripts\activate
    ```

- Mac OS/Linux

    ```shell
    source venv/bin/activate
  
  OR
  
    . ./venv/bin/activate  
    ```

The parenthesized (venv) in front of the prompt indicates that you’ve successfully activated the virtual environment.

## Deactivate Virtual Env
```shell
deactivate
```

## Upgrade ```pip``` release

```shell
pip install --upgrade pip
```

## Install Packages



## Install Requirements

```shell
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
```



## Save Requirements (Dependencies)
```shell
pip freeze > requirements.txt
```


## Configuration Setup

Set local configuration file.

```shell
pip install python-dotenv
cp default.env .env
```

Now, update the default local configurations as follows:

```text
APP_HOST = 0.0.0.0
APP_PORT = 8081
```

**By default**, Flask will run the application on **port 5000**.

## Run Flask Application

```shell
python -m flask --app webapp run --port 8081 --debug
```

**Note**:- You can stop the development server by pressing ```Ctrl+C``` in your terminal.


## Access Application
```shell
http://localhost:8081/ecommerce-iws
```


## Capacity Planning

### CPU Bound Systems

- Formula
```text
RPS = TotalCore * (1/TaskDurationInSeconds)

i.e.:
4 * (1000/100) = 40

```

| Total Cores  | Task Duration | RPS |
|:------------:|:--------------|:----|
|      4       | 100ms         | 40  |
|      4       | 50ms          | 80  |
|      4       | 10ms          | 400 |



# Reference

- [how-to-use-aws-iam-in-terraform](https://meirg.co.il/2024/02/15/how-to-use-aws-iam-in-terraform/)


# Author

---

- Rohtash Lakra
