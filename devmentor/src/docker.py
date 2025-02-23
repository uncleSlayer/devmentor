import docker
import tempfile
import os
import re


def run_ai_answer_code(code_block: str):

    code_block = re.sub(r"^```(?:python)?\n", "", code_block)
    code_block = re.sub(r"\n```$", "", code_block)

    with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w") as temp_file:

        temp_file.write(code_block)
        host_script_path = temp_file.name

    host_script_path = os.path.abspath(host_script_path)
    container_script_path = "/app/script.py"

    docker_client = docker.from_env()

    try:

        container = docker_client.containers.run(
            image="python:3.10-slim",
            command=["python", container_script_path],
            volumes={host_script_path: {"bind": container_script_path, "mode": "ro"}},
            detach=True,
            mem_limit="100m",
            cpu_quota=50000,
        )

        container.wait()

        output = container.logs().decode("utf-8")

        print("\n")
        print("============================")
        print("==========result============")
        print(output)
        print("============================")

    except Exception as e:

        output = f"Error during execution: {e}"
    
    finally:
        
        try:
            container.remove()
        except Exception:
            pass

        os.remove(host_script_path)

    return output
